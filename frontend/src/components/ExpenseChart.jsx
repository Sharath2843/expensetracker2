import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ExpenseChart = ({ transactions }) => {
  const chartRef = useRef();

  useEffect(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
      d3.select(chartRef.current).selectAll("*").remove();
      return;
    }

    const groupedData = d3.rollup(
      expenses,
      v => d3.sum(v, d => d.amount),
      d => d.category
    );

    const data = Array.from(groupedData, ([category, amount]) => ({ category, amount }));

    const width = 280;
    const height = 280;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Crypto Vault aesthetic colors (Copper accents, greens, charcoals, pale oranges)
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(["#b87333", "#d4945a", "#c9845a", "#6b8e6b", "#4a4a4c", "#c27878", "#8e6c46"]);

    const pie = d3.pie()
      .value(d => d.amount)
      .sort(null);
      
    const data_ready = pie(data);

    // Slimmer doughnut for a more premium look
    const arcGenerator = d3.arc()
      .innerRadius(radius * 0.7) 
      .outerRadius(radius);

    const slices = svg
      .selectAll('mySlices')
      .data(data_ready)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', d => color(d.data.category))
      .attr("stroke", "#2c2c2e") // matches --bg-card
      .style("stroke-width", "5px")
      .style("opacity", 0.9)
      .style("cursor", "pointer")
      .attr("transform", "scale(0)");

    // Animation
    slices.transition()
      .duration(800)
      .attr("transform", "scale(1)")
      .attrTween("d", function(d) {
        const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function(t) {
          d.endAngle = i(t);
          return arcGenerator(d);
        }
      });

    // Inner center text background (optional, but adds to the look)
    svg.append("circle")
     .attr("r", radius * 0.6)
     .attr("fill", "#232325"); // subtle depth indent

    // Interaction
    slices
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)")
          .style("opacity", 1);
        
        svg.append("text")
           .attr("class", "center-text")
           .attr("text-anchor", "middle")
           .attr("y", -5)
           .style("fill", "#f5f0e8")
           .style("font-weight", "700")
           .style("font-size", "1.1rem")
           .text(d.data.category);
           
        svg.append("text")
           .attr("class", "center-text-amount")
           .attr("text-anchor", "middle")
           .attr("y", 20)
           .style("fill", "#b87333") // Copper color
           .style("font-weight", "600")
           .text(`₹${d.data.amount.toFixed(2)}`);
      })
      .on("mouseleave", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1)")
          .style("opacity", 0.9);
          
        svg.selectAll(".center-text").remove();
        svg.selectAll(".center-text-amount").remove();
      });

  }, [transactions]);

  const hasExpenses = transactions.filter(t => t.type === 'expense').length > 0;

  return (
    <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ marginBottom: '20px', width: '100%', fontSize: '1.2rem' }}>Expense Breakdown</h3>
      {hasExpenses ? (
        <div ref={chartRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
      ) : (
        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No expenses to chart!
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
