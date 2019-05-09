import React, { Fragment } from "react";
import data from "./data.js";

const BACKGROUND_COLOR = "white";
const BORDER_COLOR = "black";
const FONT_FAMILY = "monospace";
const LINE_WIDTH = 4;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewBox: { top: 0, left: 0, width: props.width, height: props.height },
      lines: data.map(line => ({
        ...line,
        stations: line.stations.map(station => ({
          name: station,
          x: Math.random() * props.width,
          y: Math.random() * props.height
        }))
      }))
    };
  }

  viewBox() {
    const { top, left, width, height } = this.state.viewBox;
    return `${top} ${left} ${width} ${height}`;
  }

  render() {
    return (
      <svg
        width={this.state.viewBox.width}
        height={this.state.viewBox.height}
        viewBox={this.viewBox()}
      >
        {this.state.lines.map((line, i) => (
          <Line key={i} stations={line.stations} color={line.color} />
        ))}
      </svg>
    );
  }
}

const Line = ({ stations, color }) => {
  return (
    <Fragment>
      {stations.slice(0, -1).map((station, i) => (
        <Section key={i} begin={station} end={stations[i + 1]} color={color} />
      ))}
      {stations.map((station, i) => (
        <Station key={i} name={station.name} x={station.x} y={station.y} />
      ))}
    </Fragment>
  );
};

const Station = ({ name, x, y }) => (
  <BorderedText
    x={x}
    y={y}
    stroke={BORDER_COLOR}
    style={{ fontFamily: FONT_FAMILY }}
  >
    {name}
  </BorderedText>
);

const Section = ({ color, begin, end }) => (
  <line
    x1={begin.x}
    y1={begin.y}
    x2={end.x}
    y2={end.y}
    stroke={color}
    strokeWidth={LINE_WIDTH}
  />
);

class BorderedText extends React.Component {
  constructor(props) {
    super(props);
    this.text = React.createRef();
    this.state = {
      rectProps: null
    };
  }

  componentDidMount() {
    const bbox = this.text.current.getBBox();
    this.setState({
      rectProps: {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      }
    });
  }

  render() {
    const { x, y, style, stroke, children } = this.props;

    return (
      <Fragment>
        {this.state.rectProps && (
          <rect
            stroke={stroke}
            fill={BACKGROUND_COLOR}
            {...this.state.rectProps}
          />
        )}
        <text
          ref={this.text}
          style={style}
          textAnchor="middle"
          dominantBaseline="central"
          x={x}
          y={y}
        >
          {children}
        </text>
      </Fragment>
    );
  }
}

// vim: set ts=2 sw=2 et:
