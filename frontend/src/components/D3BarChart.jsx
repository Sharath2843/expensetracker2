import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const D3BarChart = ({ data = [], granularity = 'monthly' }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    period: '', 
    income: 0, 
    expense: 0,
    incomeCategories: {},
    expenseCategories: {}
  });

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const formatLabel = (str) => {
      if (granularity === 'daily') {
        const parts = str.split('-');
        if (parts.length === 3) {
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          return `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]}`;
        }
        return str;
      } else {
        const parts = str.split('-');
        if (parts.length >= 2) {
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          return `${monthNames[parseInt(parts[1]) - 1]} '${parts[0].slice(2)}`;
        }
        return str;
      }
    };

    const formatTooltipLabel = (str) => {
      if (granularity === 'daily') {
        const parts = str.split('-');
        if (parts.length === 3) {
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          return `${parseInt(parts[2])} ${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`;
        }
        return str;
      } else {
        const parts = str.split('-');
        if (parts.length >= 2) {
          const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          return `${monthNames[parseInt(parts[1]) - 1]} ${parts[0]}`;
        }
        return str;
      }
    };

    // X scale - band for groups
    const maxTicks = 12;
    const tickInterval = Math.max(1, Math.ceil(data.length / maxTicks));

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.period))
      .rangeRound([0, width])
      .paddingInner(0.2)
      .paddingOuter(0.1);

    const x1 = d3.scaleBand()
      .domain(['income', 'expense'])
      .rangeRound([0, x0.bandwidth()])
      .padding(0.08);

    const maxVal = d3.max(data, d => Math.max(d.income, d.expense)) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([height, 0]);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
      .selectAll("line")
      .style("stroke", "rgba(255,255,255,0.05)")
      .style("stroke-dasharray", "3,3");
    svg.select(".grid .domain").remove();

    // X axis
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x0)
          .tickValues(data.map(d => d.period).filter((_, i) => i % tickInterval === 0))
          .tickFormat(formatLabel)
      );
    xAxis.selectAll("text")
      .style("fill", "var(--text-muted)")
      .style("font-size", "9px")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end");

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d >= 1000 ? `₹${(d/1000).toFixed(0)}k` : `₹${d}`))
      .selectAll("text")
      .style("fill", "var(--text-muted)");

    // Draw bars
    const groups = svg.selectAll(".bar-group")
      .data(data)
      .join("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(${x0(d.period)},0)`);

    // Income bars
    groups.append("rect")
      .attr("x", x1('income'))
      .attr("y", d => y(d.income))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.income))
      .attr("rx", 3)
      .attr("fill", "#6b8e6b")
      .attr("opacity", 0.85)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 1).attr("filter", "brightness(1.2)");
        showTooltip(event, d);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.85).attr("filter", "none");
        hideTooltip();
      });

    // Expense bars
    groups.append("rect")
      .attr("x", x1('expense'))
      .attr("y", d => y(d.expense))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.expense))
      .attr("rx", 3)
      .attr("fill", "#c27878")
      .attr("opacity", 0.85)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 1).attr("filter", "brightness(1.2)");
        showTooltip(event, d);
      })
      .on("mousemove", moveTooltip)
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.85).attr("filter", "none");
        hideTooltip();
      });

    function showTooltip(event, d) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top - 10,
        period: formatTooltipLabel(d.period),
        income: d.income,
        expense: d.expense,
        incomeCategories: d.incomeCategories || {},
        expenseCategories: d.expenseCategories || {}
      });
    }

    function moveTooltip(event) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setTooltip(prev => ({
        ...prev,
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top - 10
      }));
    }

    function hideTooltip() {
      setTooltip(prev => ({ ...prev, visible: false }));
    }

  }, [data, granularity]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <svg ref={svgRef}></svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6b8e6b' }}></div>
          Income
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#c27878' }}></div>
          Expense
        </div>
      </div>

      {tooltip.visible && (
        <div style={{
          position: 'absolute', left: tooltip.x, top: tooltip.y,
          transform: 'translate(-50%, -100%)',
          background: 'linear-gradient(135deg, #2c2c2e 0%, #3a3a3c 100%)',
          border: '1px solid rgba(184, 115, 51, 0.4)', borderRadius: '12px',
          padding: '12px 18px', pointerEvents: 'none', zIndex: 1000, minWidth: '220px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          animation: 'tooltipFadeIn 0.2s ease-out'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#a8a8a8', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
            {tooltip.period}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#6b8e6b', fontWeight: 600 }}>INCOME</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f5f0e8' }}>
                ₹{tooltip.income.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#c27878', fontWeight: 600 }}>EXPENSE</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f5f0e8' }}>
                ₹{tooltip.expense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {((tooltip.incomeCategories && Object.keys(tooltip.incomeCategories).length > 0) || 
            (tooltip.expenseCategories && Object.keys(tooltip.expenseCategories).length > 0)) && (
            <div style={{ 
              marginTop: '12px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
              paddingTop: '8px', 
              fontSize: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {Object.keys(tooltip.incomeCategories).length > 0 && (
                <div>
                  <div style={{ color: '#6b8e6b', fontWeight: 600, fontSize: '0.65rem', marginBottom: '2px' }}>INCOME SOURCES</div>
                  {Object.entries(tooltip.incomeCategories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, val]) => (
                      <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0', gap: '8px' }}>
                        <span>{cat}</span>
                        <span style={{ fontWeight: 600 }}>₹{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))
                  }
                </div>
              )}
              {Object.keys(tooltip.expenseCategories).length > 0 && (
                <div style={{ marginTop: Object.keys(tooltip.incomeCategories).length > 0 ? '4px' : '0' }}>
                  <div style={{ color: '#c27878', fontWeight: 600, fontSize: '0.65rem', marginBottom: '2px' }}>EXPENSE BREAKDOWN</div>
                  {Object.entries(tooltip.expenseCategories)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, val]) => (
                      <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0', gap: '8px' }}>
                        <span>{cat}</span>
                        <span style={{ fontWeight: 600 }}>₹{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          <div style={{
            position: 'absolute', bottom: '-6px', left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '12px', height: '12px', background: '#3a3a3c',
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

export default D3BarChart;
