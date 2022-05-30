var cur_line = 'var_1';
var var_list = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

d3.json('data/dataset.json')
	.then(function(data) {
			draw_plot(data);
});

function draw_plot(data) {
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 400, bottom: 20, left: 50},
        width = 1080 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#my_graphic")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // List of subgroups
    const subgroups = ['var_1', 'var_2', 'var_3', 'var_4', 'var_5'];

    // Add X axis
    const x = d3.scaleBand()
        .domain(var_list)
        .range([0, width])
        .padding([0.5])

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

    sum_max = d3.max(data.map(elem => d3.sum(Object.values(elem).slice(1))));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([-sum_max, sum_max])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisRight(y)
            .tickSize(width))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick line")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-dasharray", "2,2"))
        .call(g => g.selectAll(".tick text")
            .attr("x", -32)
            .attr("dy", 0))


    let colors = ["#d62728","#1f77b4","#2ca02c","#ff7f0e","#9467bd"];


    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(colors)

    // Draw legend
    var legend = svg.selectAll(".legend")
        .data(colors)
        .join("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(18," + i * 18 + ")"; });

    legend.append("rect")
        .attr("x", width - 10)
        .attr("width", 20)
        .attr("height", 18)
        .style("fill", function(d, i) {return colors.slice()[i];});

    legend.append("text")
        .attr("x", width + 11)
        .attr("y", 9)
        .attr("dy", ".39em")
        .style("text-anchor", "start")
        .text(function(d, i) {
            switch (i) {
                case 0: return "campo 1";
                case 1: return "campo 2";
                case 2: return "campo 3";
                case 3: return "campo 4";
                case 4: return "campo 5";
            }
        });


    const stackedData = d3.stack()
        .keys(subgroups)
        (data)


    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr('class', d => 'rect-group rect-' + d.key)
        .on("mouseover", function(event, d) {
            // Reduce opacity of all rect groups
            d3.selectAll('.rect-group').transition().duration(400).style("opacity", 0.5)
            // Highlight all rects of this subgroup with opacity 1. It is possible to select them since they have a specific class = their name.
            d3.select('.rect-' + d.key).transition().duration(400).style("opacity", 1)
        })
        .on("mouseleave", function(event, d) {
            // Back to normal opacity: 1
            d3.selectAll('.rect-group').transition().duration(400).style("opacity", 1)
        })
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.id))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr('data-case', d => d.data.id)
        .attr('class', d => 'rect-data');

    svg.select('y.axis').transition()
        .duration(900)
        .ease('quad-in-out')
        .call(yAxis);


    d3.selectAll('.rect-data')
        .each(function(d, i) {
            d3.select(this).attr('key', d3.select(this).node().parentNode.classList[1].substring(5))
        });
};





