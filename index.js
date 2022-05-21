var cur_line = 'var_1';
var var_list = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

d3.json('data/dataset.json')
	.then(function(data) {
			draw_plot(data);
});

function draw_plot(data) {
    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 200, bottom: 20, left: 50},
        width = 1060 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

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
        .padding([0.2])

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
            .attr("stroke-opacity", 0.5)
            .attr("stroke-dasharray", "2,2"))
        .call(g => g.selectAll(".tick text")
            .attr("x", -32)
            .attr("dy", 0))


    let colors = ["#d62728","#1f77b4","#2ca02c","#ff7f0e","#9467bd"];

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(colors)

    // Draw legend
    var legend = svg.selectAll(".legend")
        .data(colors)
        .join("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(18," + i * 19 + ")"; });

    legend.append("rect")
        .attr("x", width - 10)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) {return colors.slice()[i];});

    legend.append("text")
        .attr("x", width + 10)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d, i) {
            switch (i) {
                case 0: return "var_1";
                case 1: return "var_2";
                case 2: return "var_3";
                case 3: return "var_4";
                case 4: return "var_5";
            }
        });

    //stack per subgroup
    const stackedData = d3.stack()
        .keys(subgroups)
        (data)

    // Show the bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr('class', d => 'rect-group rect-' + d.key)
        .on("mouseover", function(event, d) {
            // Reduce opacity of all rect groups
            d3.selectAll('.rect-group').transition().duration(400).style("opacity", 0.8)
            // Highlight all rects of this subgroup with opacity 1. It is possible to select them since they have a specific class = their name.
            d3.select('.rect-' + d.key).transition().duration(400).style("opacity", 1)
        })
        .on("mouseleave", function(event, d) {
            // Back to normal opacity: 1
            d3.selectAll('.rect-group').transition().duration(400).style("opacity", 1)
        })
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.id))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr('data-case', d => d.data.id)
        .attr('class', d => 'rect-data');

    svg.select('y.axis').transition()
        .duration(700)
        .ease('quad-in-out')
        .call(yAxis);

    // add the key corresponding to multivariate field (like 'var_1', 'var_2' etc.)
    d3.selectAll('.rect-data')
        .each(function(d, i) {
            d3.select(this).attr('key', d3.select(this).node().parentNode.classList[1].substring(5))
        });

    d3.selectAll('.rect-data')
        .on('click', function(e, d) {
            clicked_group = d3.select(this)
            key = clicked_group.node().parentNode.classList[1].substring(5);
            alignStacks(key);
        });

};

function alignStacks(key) {
  let key_list = ['var_1', 'var_2', 'var_3', 'var_4', 'var_5'];
  let moveDown = false;
  let key_align_interval = [];
  let i_curr = key_list.indexOf(cur_line);
  let i_key = key_list.indexOf(key);

  if (i_key < i_curr) {
    moveDown = false;
    key_align_interval = key_list.slice(i_key, i_curr);
  }
  else if (i_key > i_curr) {
    moveDown = true;
    key_align_interval = key_list.slice(i_curr, i_key);
  }

  moveStacks(key_align_interval, moveDown);
  cur_line = key;
};



function moveStacks(keys, moveDown) {
  let datacase_sum_height = [];
  let key_list = ['var_1', 'var_2', 'var_3', 'var_4', 'var_5'];

 if (keys.length == 0)
    return;

  //sum slice of keys to move by y, then decide if *(-1) based on moveDown
  for (let i of var_list) {
    datacase_sum_height[i] = 0;
    for (let key of keys) {
      // select the i-th data-case and all of the keys to sum (one by one)
      data_case_attr = "[data-case='"+i+"']";
      key_attr = "[key='"+key+"']";
      single_rect = d3.select(data_case_attr+key_attr);
      datacase_sum_height[i] += parseFloat(single_rect.attr('height'));
    }
    if (!moveDown)
      datacase_sum_height[i] *= -1; 
  }

  for (let i of var_list) {
    for (let key of key_list) {
      // select the i-th data-case and all of the keys to sum (one by one)
      data_case_attr = "[data-case='"+i+"']";
      key_attr = "[key='"+key+"']";
      single_rect = d3.select(data_case_attr+key_attr);
      current_rect_y = single_rect.attr('y');
      new_rect_y = parseFloat(current_rect_y) + datacase_sum_height[i];
      single_rect.transition().duration(500).attr('y', new_rect_y);
    }
  }

}



