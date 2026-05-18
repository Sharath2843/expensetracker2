import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const D3Heatmap = ({ data = [] }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, date: '', amount: 0, categories: {} });

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();
    if (!data || data.length === 0) return;

    // Parse dates and build lookup
    const dateMap = {};
    const categoriesMap = {};
    data.forEach(d => { 
      dateMap[d.date] = d.amount; 
      categoriesMap[d.date] = d.categories || {};
    });

    // Determine date range
    const dates = data.map(d => new Date(d.date));
    const minDate = d3.min(dates);
    const maxDate = d3.max(dates);

    // Generate all weeks between min and max
    const startDate = d3.timeWeek.floor(minDate);
    const endDate = d3.timeWeek.ceil(d3.timeDay.offset(maxDate, 1));
    
    const allDays = d3.timeDays(startDate, endDate);
    const weeks = d3.timeWeeks(startDate, endDate);

    const cellSize = 14;
    const cellGap = 3;
    const totalCellSize = cellSize + cellGap;

    const margin = { top: 30, right: 15, bottom: 15, left: 35 };
    const width = Math.min(weeks.length * totalCellSize + margin.left + margin.right, 520);
    const height = 7 * totalCellSize + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale
    const maxAmount = d3.max(data, d => d.amount) || 1;
    const colorScale = d3.scaleSequential()
      .domain([0, maxAmount])
      .interpolator(d3.interpolateRgbBasis(['#2c2c2e', '#4a3520', '#8b5e2f', '#b87333', '#d4945a', '#f0c78a']));

    // Day labels
    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    svg.selectAll('.dayLabel')
      .data(dayLabels)
      .join('text')
      .attr('x', -8)
      .attr('y', (d, i) => i * totalCellSize + cellSize / 2 + 4)
      .text(d => d)
      .style('fill', 'var(--text-muted)')
      .style('font-size', '9px')
      .style('text-anchor', 'end');

    // Month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const month = week.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: monthNames[month], x: i * totalCellSize });
        lastMonth = month;
      }
    });

    svg.selectAll('.monthLabel')
      .data(monthLabels)
      .join('text')
      .attr('x', d => d.x)
      .attr('y', -10)
      .text(d => d.month)
      .style('fill', 'var(--text-muted)')
      .style('font-size', '10px')
      .style('text-anchor', 'start');

    // Draw cells
    svg.selectAll('.day-cell')
      .data(allDays)
      .join('rect')
      .attr('class', 'day-cell')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 3)
      .attr('x', d => {
        const weekIdx = d3.timeWeek.count(startDate, d);
        return weekIdx * totalCellSize;
      })
      .attr('y', d => d.getDay() * totalCellSize)
      .attr('fill', d => {
        const key = d3.timeFormat('%Y-%m-%d')(d);
        const amount = dateMap[key] || 0;
        return amount > 0 ? colorScale(amount) : '#2c2c2e';
      })
      .attr('stroke', '#3a3a3c')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        const key = d3.timeFormat('%Y-%m-%d')(d);
        const amount = dateMap[key] || 0;
        const categories = categoriesMap[key] || {};
        d3.select(this).attr('stroke', '#b87333').attr('stroke-width', 2);
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const formattedDate = d3.timeFormat('%d %b %Y')(d);
        setTooltip({
          visible: true,
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top - 10,
          date: formattedDate,
          amount: amount,
          categories: categories
        });
      })
      .on('mousemove', function(event) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setTooltip(prev => ({
          ...prev,
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top - 10
        }));
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', '#3a3a3c').attr('stroke-width', 0.5);
        setTooltip(prev => ({ ...prev, visible: false }));
      });

  }, [data]);

  return (
    <div ref={containerRef} style={{ position: 'relative', overflowX: 'auto' }}>
      <svg ref={svgRef}></svg>

      {/* Color scale legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', justifyContent: 'flex-end', paddingRight: '15px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Less</span>
        {['#2c2c2e', '#4a3520', '#8b5e2f', '#b87333', '#d4945a'].map((color, i) => (
          <div key={i} style={{
            width: '12px', height: '12px', borderRadius: '3px',
            background: color, border: '1px solid #3a3a3c'
          }}></div>
        ))}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>More</span>
      </div>

      {tooltip.visible && (
        <div style={{
          position: 'absolute', left: tooltip.x, top: tooltip.y,
          transform: 'translate(-50%, -100%)',
          background: 'linear-gradient(135deg, #2c2c2e 0%, #3a3a3c 100%)',
          border: '1px solid rgba(184, 115, 51, 0.4)', borderRadius: '10px',
          padding: '10px 14px', pointerEvents: 'none', zIndex: 1000,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          animation: 'tooltipFadeIn 0.2s ease-out', whiteSpace: 'nowrap'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#a8a8a8', fontWeight: 600 }}>
            {tooltip.date}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: tooltip.amount > 0 ? '#f5f0e8' : 'var(--text-muted)', marginTop: '2px' }}>
            {tooltip.amount > 0
              ? `₹${tooltip.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : 'No expenses'}
          </div>

          {tooltip.amount > 0 && tooltip.categories && Object.keys(tooltip.categories).length > 0 && (
            <div style={{
              marginTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '6px',
              fontSize: '0.7rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {Object.entries(tooltip.categories)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, val]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0', gap: '12px' }}>
                    <span>{cat}</span>
                    <span style={{ fontWeight: 600 }}>₹{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                ))
              }
            </div>
          )}

          <div style={{
            position: 'absolute', bottom: '-5px', left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '10px', height: '10px', background: '#3a3a3c',
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

export default D3Heatmap;
