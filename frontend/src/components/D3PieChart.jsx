import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const D3PieChart = ({ data = [] }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, category: '', value: 0, percent: 0 });

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Clear old drawings for hot-reload or data updates
    d3.select(svgElement).selectAll("*").remove();

    if (!data || data.length === 0) return;

    const width = 300;
    const height = 300;
    const margin = 20;

    const radius = Math.min(width, height) / 2 - margin;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    const svg = d3.select(svgElement)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(d3.schemeSet2);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const data_ready = pie(data);

    // Donut chart layout
    const arc = d3.arc()
      .innerRadius(radius * 0.5) 
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius + 10);

    svg.selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.category))
      .attr("stroke", "#1c1c1e")
      .style("stroke-width", "2px")
      .style("opacity", 0.9)
      .style("cursor", "pointer")
      .style("transition", "opacity 0.2s")
      .on("mouseover", function(event, d) {
           d3.select(this)
             .style("opacity", 1)
             .transition().duration(200)
             .attr("d", arcHover);

           const containerRect = containerRef.current.getBoundingClientRect();
           const percent = ((d.data.value / total) * 100).toFixed(1);
           
           setTooltip({
             visible: true,
             x: event.clientX - containerRect.left,
             y: event.clientY - containerRect.top - 10,
             category: d.data.category,
             value: d.data.value,
             percent: percent
           });
      })
      .on("mousemove", function(event) {
           const containerRect = containerRef.current.getBoundingClientRect();
           setTooltip(prev => ({
             ...prev,
             x: event.clientX - containerRect.left,
             y: event.clientY - containerRect.top - 10
           }));
      })
      .on("mouseout", function() {
           d3.select(this)
             .style("opacity", 0.9)
             .transition().duration(200)
             .attr("d", arc);
           setTooltip(prev => ({ ...prev, visible: false }));
      })
      // Touch support for mobile
      .on("touchstart", function(event, d) {
           event.preventDefault();
           d3.select(this)
             .style("opacity", 1)
             .transition().duration(200)
             .attr("d", arcHover);

           const touch = event.touches[0];
           const containerRect = containerRef.current.getBoundingClientRect();
           const percent = ((d.data.value / total) * 100).toFixed(1);

           setTooltip({
             visible: true,
             x: touch.clientX - containerRect.left,
             y: touch.clientY - containerRect.top - 10,
             category: d.data.category,
             value: d.data.value,
             percent: percent
           });
      })
      .on("touchend", function() {
           d3.select(this)
             .style("opacity", 0.9)
             .transition().duration(200)
             .attr("d", arc);
           setTimeout(() => setTooltip(prev => ({ ...prev, visible: false })), 2000);
      });
      
    // Add text labels
    const labelArc = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    svg.selectAll('text')
      .data(data_ready)
      .join('text')
      .text(d => d.data.category)
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", 10)
      .style("fill", "#fff")
        // prevent overlap for tiny slices
      .style("display", d => (d.endAngle - d.startAngle) > 0.3 ? "block" : "none")
      .style("pointer-events", "none");

  }, [data]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <svg ref={svgRef}></svg>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'linear-gradient(135deg, #2c2c2e 0%, #3a3a3c 100%)',
            border: '1px solid rgba(184, 115, 51, 0.4)',
            borderRadius: '12px',
            padding: '12px 18px',
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '160px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            animation: 'tooltipFadeIn 0.2s ease-out'
          }}
        >
          {/* Category name */}
          <div style={{
            fontSize: '0.8rem',
            color: '#a8a8a8',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600
          }}>
            {tooltip.category}
          </div>

          {/* Amount */}
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#f5f0e8',
            lineHeight: 1.2
          }}>
            ₹{tooltip.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {/* Percentage */}
          <div style={{
            fontSize: '0.8rem',
            color: '#c9845a',
            marginTop: '4px',
            fontWeight: 500
          }}>
            {tooltip.percent}% of total
          </div>

          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '12px',
            height: '12px',
            background: '#3a3a3c',
            borderRight: '1px solid rgba(184, 115, 51, 0.4)',
            borderBottom: '1px solid rgba(184, 115, 51, 0.4)',
          }}></div>
        </div>
      )}

      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translate(-50%, -90%); }
          to { opacity: 1; transform: translate(-50%, -100%); }
        }
      `}</style>
    </div>
  );
};

export default D3PieChart;
