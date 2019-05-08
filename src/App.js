import React from "react";
import data from "./data.js";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewBox: { top: 0, left: 0, width: props.width, height: props.height },
      lines: data.map(line => ({
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
          <Line key={i} stations={line.stations} />
        ))}
      </svg>
    );
  }
}

const Line = ({ stations }) =>
  stations.map((station, i) => (
    <Station key={i} name={station.name} x={station.x} y={station.y} />
  ));

const Station = ({ name, x, y }) => {
  return (
    <TextBox x={x} y={y} stroke="black" style={{ font: "10px monospace" }}>
      {name}
    </TextBox>
  );
};

class TextBox extends React.Component {
  constructor(props) {
    super(props);
    this.rect = React.createRef();
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
      <g>
        <text ref={this.text} x={x} y={y} style={style}>
          {children}
        </text>
        {this.state.rectProps && (
          <rect
            ref={this.rect}
            stroke={stroke}
            fill="none"
            {...this.state.rectProps}
          />
        )}
      </g>
    );
  }
}

// vim: set ts=2 sw=2 et:
