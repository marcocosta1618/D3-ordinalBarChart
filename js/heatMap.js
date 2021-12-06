import tooltip from "./tooltip.js"; 

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url)
    .catch(handleErrors)
    .then(data => {
        // DATA
        const baseTemp = data.baseTemperature;
        const dataSet = data.monthlyVariance;
        const varianceRange = d3.max(dataSet, d => d.variance) - d3.min(dataSet, d => d.variance);
        const minTemp = d3.min(dataSet, d => d.variance + baseTemp);

        // GRAPH CONSTANTS
        const w = 2000;
        const h = 480;
        const padLeft = 75;
        const padRight = 50;
        const padTop = 30;
        const padBottom = 30;
        const colors = (val) => d3.interpolateRdBu(val);
        const { handleMouseover, handleMouseout, getGraphRect } = tooltip();

        // SCALES
        // (years array (no duplicates))
        const dataYears = dataSet.reduce((acc, curr) => {
            return curr.year !== acc[acc.length - 1]
                ? acc.concat(curr.year) : acc
        }, []);
        // X
        const xScale = d3.scaleBand()
            .domain(dataYears)
            .range([padLeft, w - padRight]);
        // Y
        const yScale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .range([padTop, h - padBottom]);

        // AXES
        // X
        const xAxis = d3.axisBottom(xScale)
            .tickValues(dataYears.reduce((acc, curr) => {
                return curr % 10 === 0 ? acc.concat(curr) : acc
            }, []));
        // Y
        const formatMonth = d3.timeFormat('%B');
        const yAxis = d3.axisLeft(yScale)
            .tickValues(yScale.domain())
            .tickFormat(month => {
                const date = new Date();
                date.setUTCMonth(month);
                return formatMonth(date)
            });

        // heatMap SVG AREA
        const heatMap = d3.select('div.graph-container')
            .append('svg')
            .attr('id', 'graph')
            .attr('width', w)
            .attr('height', h);

        // MAP RECTS AREA TO YEAR / MONTH
        heatMap.selectAll('rect')
            .data(dataSet)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.year))      // band x start 
            .attr('width', xScale.bandwidth())   // band x bandwwidth
            .attr('y', d => yScale(d.month - 1)) // band y start
            .attr('height', yScale.bandwidth())  // band y bandwidth
            .attr('data-year', d => d.year)
            .attr('data-month', d => d.month - 1) // data range is 1/12 but suite tests for 0/11 ? 
            .attr('data-temp', d => baseTemp + d.variance)
            .attr('stroke', 'black')
            .attr('stroke-width', 0)
            .attr('fill', d => {
                // scale temp values to 0 - 1 ( 1.01 - => invert color scheme and slightly push toward the blue tones)
                const scaleTemp = 1.1 - (d.variance + baseTemp) / varianceRange; 
                return colors(scaleTemp)})
            .on('mouseover', handleMouseover)
            .on('mouseout', handleMouseout);

        // DRAW AXES
        heatMap.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0, ${h - padBottom})`)
            .call(xAxis);
        heatMap.append('g')
            .attr('id', 'y-axis')
            .attr('transform', `translate(${padLeft}, 0)`)
            .call(yAxis);

        // LEGEND
        const legendColor = [1, 0.875, 0.75, 0.625, 0.5, 0.375, 0.25, 0.125, 0];
        const legend = d3.select('div.graph-container')
            .append('svg')
            .attr('id', 'legend');
        legend.selectAll('rect')
            .data(legendColor)
            .enter()
            .append('rect')
            .attr('x', (d, i) => (i % 3) * 60)
            .attr('y', (d, i) => i > 5 ? 80 : i > 2 ? 40 : 0)
            .attr('width', 45)
            .attr('height', 16)
            .attr('stroke', 'black')
            .attr('fill', colors)
        legend.selectAll('text')
            .data(legendColor)
            .enter()
            .append('text')
            .attr('x', (d, i) => (i % 3) * 60 + 5)
            .attr('y', (d, i) => i > 5 ? 110 : i > 2 ? 70 : 30)
            .attr('font-size', '0.8rem')
            .text(d => {
                const temp = (1 - d) * varianceRange + minTemp;
                return temp.toFixed(1) + '°C'
            })

        getGraphRect();
    });

function handleErrors(error) {
    let errorMsg = document.createElement('h3');
    errorMsg.textContent = 'Sorry, something went wrong. ' + error;
    document.querySelector('#description').insertAdjacentElement('afterend', errorMsg);
}