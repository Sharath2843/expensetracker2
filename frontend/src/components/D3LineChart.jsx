import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const D3LineChart = ({ data, granularity = 'monthly' }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, label: '', expense: 0 });

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();
    if (!data || data.length === 0) return;

    const margin = {top: 20, right: 30, bottom: 50, left: 60};
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.5);

    // Format x-axis labels based on granularity
    const formatLabel = (str) => {
      if (granularity === 'daily') {
        // str is YYYY-MM-DD → show "DD Mon"
        const parts = str.split('-');
        if (parts.length === 3) {
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const day = parseInt(parts[2], 10);
          const monthIdx = parseInt(parts[1], 10) - 1;
          return `${day} ${monthNames[monthIdx]}`;
        }
        return str;
      } else {
        // str is YYYY-MM → show "Mon YY"
        const parts = str.split('-');
        if (parts.length >= 2) {
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const monthIdx = parseInt(parts[1], 10) - 1;
          const year = parts[0].slice(2);
          return `${monthNames[monthIdx]} '${year}`;
        }
        return str;
      }
    };

    // Format tooltip label (more detailed)
    const formatTooltipLabel = (str) => {
      if (granularity === 'daily') {
        const parts = str.split('-');
        if (parts.length === 3) {
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const day = parseInt(parts[2], 10);
          const monthIdx = parseInt(parts[1], 10) - 1;
          return `${day} ${monthNames[monthIdx]} ${parts[0]}`;
        }
        return str;
      } else {
        const parts = str.split('-');
        if (parts.length >= 2) {
          const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          const monthIdx = parseInt(parts[1], 10) - 1;
          return `${monthNames[monthIdx]} ${parts[0]}`;
        }
        return str;
      }
    };

    // Determine how many tick labels to show so they don't overlap
    const maxTicks = granularity === 'daily' ? 10 : 12;
    const tickInterval = Math.max(1, Math.ceil(data.length / maxTicks));

    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .tickValues(data.map((d, i) => d.month).filter((_, i) => i % tickInterval === 0))
          .tickFormat(formatLabel)
      );

    xAxis.selectAll("text")
      .style("fill", "var(--text-muted)")
      .style("font-size", granularity === 'daily' ? "9px" : "10px")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end");

    // Y axis
    const maxVal = d3.max(data, d => d.expense) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => {
        if (d >= 1000) return `₹${(d/1000).toFixed(0)}k`;
        return `₹${d}`;
      }))
      .selectAll("text")
      .style("fill", "var(--text-muted)");

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
      .selectAll("line")
      .style("stroke", "rgba(255,255,255,0.05)")
      .style("stroke-dasharray", "3,3");

    svg.select(".grid .domain").remove();

    // Area fill under the line
    const area = d3.area()
      .x(d => x(d.month))
      .y0(height)
      .y1(d => y(d.expense))
      .curve(d3.curveMonotoneX);

    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "areaGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#b87333")
      .attr("stop-opacity", 0.3);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#b87333")
      .attr("stop-opacity", 0.02);

    svg.append("path")
      .datum(data)
      .attr("fill", "url(#areaGradient)")
      .attr("d", area);

    // Line
    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.expense))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#b87333")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    // Vertical hover line
    const hoverLine = svg.append("line")
      .attr("class", "hover-line")
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", "rgba(184, 115, 51, 0.4)")
      .style("stroke-width", "1px")
      .style("stroke-dasharray", "4,4")
      .style("opacity", 0);

    // Dots
    svg.selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.month))
      .attr("cy", d => y(d.expense))
      .attr("r", data.length > 20 ? 3.5 : 5)
      .attr("fill", "#1c1c1e")
      .attr("stroke", "#b87333")
      .attr("stroke-width", 2.5)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
          d3.select(this)
            .transition().duration(150)
            .attr("r", data.length > 20 ? 6 : 9)
            .attr("fill", "#b87333")
            .attr("stroke", "#f5f0e8");

          hoverLine
            .attr("x1", x(d.month))
            .attr("x2", x(d.month))
            .style("opacity", 1);

          const containerRect = containerRef.current.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: event.clientX - containerRect.left,
            y: event.clientY - containerRect.top - 10,
            label: formatTooltipLabel(d.month),
            expense: d.expense
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
            .transition().duration(150)
            .attr("r", data.length > 20 ? 3.5 : 5)
            .attr("fill", "#1c1c1e")
            .attr("stroke", "#b87333");

          hoverLine.style("opacity", 0);
          setTooltip(prev => ({ ...prev, visible: false }));
      })
      // Touch support
      .on("touchstart", function(event, d) {
          event.preventDefault();
          d3.select(this)
            .transition().duration(150)
            .attr("r", data.length > 20 ? 6 : 9)
            .attr("fill", "#b87333")
            .attr("stroke", "#f5f0e8");

          hoverLine
            .attr("x1", x(d.month))
            .attr("x2", x(d.month))
            .style("opacity", 1);

          const touch = event.touches[0];
          const containerRect = containerRef.current.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: touch.clientX - containerRect.left,
            y: touch.clientY - containerRect.top - 10,
            label: formatTooltipLabel(d.month),
            expense: d.expense
          });
      })
      .on("touchend", function() {
          d3.select(this)
            .transition().duration(150)
            .attr("r", data.length > 20 ? 3.5 : 5)
            .attr("fill", "#1c1c1e")
            .attr("stroke", "#b87333");

          hoverLine.style("opacity", 0);
          setTimeout(() => setTooltip(prev => ({ ...prev, visible: false })), 2000);
      });

  }, [data, granularity]);

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
            minWidth: '150px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            animation: 'tooltipFadeIn 0.2s ease-out'
          }}
        >
          {/* Period label */}
          <div style={{
            fontSize: '0.8rem',
            color: '#a8a8a8',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600
          }}>
            {tooltip.label}
          </div>

          {/* Expense Amount */}
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#f5f0e8',
            lineHeight: 1.2
          }}>
            ₹{tooltip.expense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {/* Label */}
          <div style={{
            fontSize: '0.8rem',
            color: '#c9845a',
            marginTop: '4px',
            fontWeight: 500
          }}>
            {granularity === 'daily' ? 'Daily Expense' : 'Monthly Expense'}
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

export default D3LineChart;
