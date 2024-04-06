import './style.css'
import * as d3 from "d3"


const DATASETS = {
  videogames: {
    TITLE: 'Video Game Sales',
    DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
  },
  movies: {
    TITLE: 'Movie Sales',
    DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
  },
  kickstarter: {
    TITLE: 'Kickstarter Pledges',
    DESCRIPTION:
      'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
  }
};

var urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET = 'videogames';
const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

const ready = function (data) {

  const w = 1100;

  const h = 570;

  const color = d3.scaleOrdinal(data.children.map((x) => x.name), d3.schemeTableau10);

  //////////NAVBAR//////////  

  const navbar = d3.select('#app')
    .append('div')
    .attr('id', 'navbar');

  navbar.append('a')
    .attr('href', '?data=videogames')
    .attr('class', 'dataLink')
    .attr('style', 'background: #f28e2c; color: black;')
    .text('VIDEO GAME DATA SET')
    .on('mouseover', function () { this.style.background = 'black'; this.style.color = '#f28e2c'; })
    .on('mouseout', function () { this.style.background = '#f28e2c'; this.style.color = 'black'; });

  navbar.append('a')
    .attr('href', '?data=movies')
    .attr('class', 'dataLink')
    .attr('style', 'background: #4e79a7; color: black;')
    .text('MOVIES DATA SET')
    .on('mouseover', function () { this.style.background = 'black'; this.style.color = '#4e79a7'; })
    .on('mouseout', function () { this.style.background = '#4e79a7'; this.style.color = 'black'; });

  navbar.append('a')
    .attr('href', '?data=kickstarter')
    .attr('class', 'dataLink')
    .attr('style', 'background: #e15759; color: black;')
    .text('KICKSTARTER DATA SET')
    .on('mouseover', function () { this.style.background = 'black'; this.style.color = '#e15759'; })
    .on('mouseout', function () { this.style.background = '#e15759'; this.style.color = 'black'; });

  //////////TITLE AND DESCRIPTION//////////    

  d3.select('#app')
    .append('h1')
    .attr('id', 'title')
    .text(DATASET.TITLE);

  d3.select('#app')
    .append('h3')
    .attr('id', 'description')
    .text(DATASET.DESCRIPTION);

  //////////TREEMAP SVG//////////

  const root = d3.treemap()
    .tile(d3.treemapSquarify)
    .size([w, h])
    .padding(1)
    (d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value));

  const svg = d3.select('#app').append("svg")
    .attr("viewBox", [0, 0, w, h])
    .attr("width", w)
    .attr("height", h)
    .attr("style", "max-width: 100%; font: 10px sans-serif;");

  const leaf = svg.selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  leaf.append("rect")
    .attr("id", (d, i) => d.data.value)
    .attr('class', 'tile')
    .attr('data-name', (d) => d.data.name)
    .attr('data-category', (d) => d.data.category)
    .attr('data-value', (d) => d.data.value)
    .attr("fill", d => color(d.data.category))
    .attr("fill-opacity", 1)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0);

  leaf.append("clipPath")
    .attr("id", function (d) { return "clip-" + d.data.value; })
    .append("use")
    .attr("xlink:href", function (d) { return "#" + d.data.value; });


  leaf.append("text")
    .attr("clip-path", function (d) { return "url(#clip-" + d.data.value + ")"; })
    .selectAll("tspan")
    .data(function (d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
    .attr("x", 4)
    .attr("y", function (d, i) { return 12 + i * 10; })
    .text(function (d) { return d })
    .style("pointer-events", "none");

  //////////LEGEND///////////
  const legendNames = data.children.map((x) => x.name);

  const legendRows = Math.ceil(legendNames.length / 3);

  const legend = d3.select('#app')
    .append('svg')
    .attr('id', 'legend')
    .attr('width', 450)
    .attr('height', 300);

  legend.selectAll('g')
    .data(legendNames)
    .enter()
    .append('g')
    .attr('class', 'legendG')
    .append('rect')
    .attr('class', 'legend-item')
    .attr('height', '20px')
    .attr('width', '20px')
    .attr('fill', (d) => color(d))
    .attr('x', (d, i) => 35 + Math.floor(i / legendRows) * 155)
    .attr('y', (d, i) => ((i % legendRows) * 20) + ((i % legendRows) * 20) + 20);

  legend.selectAll('.legendG')
    .append('text')
    .text((d) => d)
    .attr('x', (d, i) => (Math.floor(i / legendRows) * 155) + 60)
    .attr('y', (d, i) => ((i % legendRows) * 20) + ((i % legendRows) * 20) + 35);

  ///////////TOOLTIP///////////

  d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .append('p')
    .attr('id', 'tooltip-name')
    .attr('class', 'tooltipText');

  d3.select('#tooltip')
    .append('p')
    .attr('id', 'tooltip-category')
    .attr('class', 'tooltipText');

  d3.select('#tooltip')
    .append('p')
    .attr('id', 'tooltip-value')
    .attr('class', 'tooltipText');

  d3.selectAll('.tile')
    .data(root.leaves())
    .join('.tile')
    .on("mouseover", function () {

      d3.select(this)
        .attr("stroke", "black")
        .attr('cursor', 'pointer');
    })
    .on("mouseout", function () {

      d3.select(this)
        .attr("stroke", "none");

      d3.select("#tooltip")
        .style("opacity", 0);
    })
    .on('mousemove', function (e) {
      const cursorX = e.clientX;
      const cursorY = e.clientY;

      const dataName = this.getAttribute('data-name');
      const dataCategory = this.getAttribute('data-category');
      const dataValue = this.getAttribute('data-value');
      const textColor = this.getAttribute('fill');

      d3.select("#tooltip")
        .attr("data-value", dataValue)
        .style("opacity", 1)
        .style("left", cursorX - 160 + "px")
        .style("top", cursorY - 100 + "px")

      d3.select('#tooltip-name')
        .text("NAME: " + dataName)
        .style('color', textColor);

      d3.select('#tooltip-category')
        .text("CATEGORY: " + dataCategory)
        .style('color', textColor);

      d3.select('#tooltip-value')
        .text("VALUE: " + dataValue)
        .style('color', textColor)
    });

}

d3.json(DATASET.FILE_PATH)
  .then(d => ready(d));