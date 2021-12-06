import debounce from "./debounce.js";

export default function tooltip() {
    const tooltip = d3.select('div.graph-container')
        .append('div')
        .attr('id', 'tooltip');

    let graphRect;
    const getGraphRect = () => {
        graphRect = document.querySelector('div.graph-container').getBoundingClientRect();
    }
    window.addEventListener('resize', debounce(getGraphRect, 100));
    window.addEventListener('scroll', debounce(getGraphRect, 100));

    function handleMouseover(e) {
        const monthAbbr = [ 'Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec' ];
        const tooltipPOS = () => {
            const cursorX = e.clientX - graphRect.left;
            const cursorY = e.clientY + window.scrollY;
            const X = cursorX < graphRect.width / 2
                ? `${cursorX + 80}px`
                : `${cursorX - 80}px`;
            const Y = cursorY + 'px';
            return {
                X, Y
            };
        }

        tooltip
            .attr('data-year', this.getAttribute('data-year'))
            .html(`
                <p>${this.getAttribute('data-year')}, </p>
                <p>${monthAbbr[this.getAttribute('data-month')]}: </p>
                <p>${this.getAttribute('data-temp').slice(0, 5)}°C</p>
            `)
            .style('display', 'block')
            .style('opacity', 0.9)
            .style('left', tooltipPOS().X)
            .style('top', tooltipPOS().Y)
    }

    function handleMouseout() {
        tooltip
            .style('opacity', 0)
    }

    return {
        handleMouseover,
        handleMouseout,
        getGraphRect
    }
}