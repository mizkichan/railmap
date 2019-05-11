import React, { Fragment } from "react";
import { sum } from "lodash";
import data from "./data.js";

const BACKGROUND_COLOR = "white";
const BORDER_COLOR = "black";
const FONT_FAMILY = "monospace";
const LINE_WIDTH = 4;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    const lines = data.map(line => {
      const stations = line.stations.map(name => ({
        name,
        x: Math.random() * props.width,
        y: Math.random() * props.height
      }));

      const sections = calculateSections(stations);

      return {
        ...line,
        stations,
        sections
      };
    });

    this.state = {
      viewBox: { top: 0, left: 0, width: props.width, height: props.height },
      lines,
      score: evaluate(lines),
      temperature: (props.width + props.height) / 4
    };

    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.update();
  }

  update() {
    const modified = modifyLines(
      this.state.temperature,
      this.props.width,
      this.props.height,
      this.state.lines
    );
    const newScore = evaluate(modified);
    this.setState({ temperature: this.state.temperature * 0.9999 });
    if (this.state.score <= newScore) {
      this.setState({
        lines: modified,
        score: newScore
      });
    }
    window.requestAnimationFrame(this.update);
  }

  viewBox() {
    const { top, left, width, height } = this.state.viewBox;
    return `${top} ${left} ${width} ${height}`;
  }

  render() {
    return (
      <div>
        <svg
          width={this.state.viewBox.width}
          height={this.state.viewBox.height}
          viewBox={this.viewBox()}
        >
          {this.state.lines.map((line, i) => (
            <Line
              key={i}
              stations={line.stations}
              sections={line.sections}
              color={line.color}
            />
          ))}
        </svg>

        <table>
          <tbody>
            <tr>
              <th>score</th>
              <td>{this.state.score}</td>
            </tr>
            <tr>
              <th>temperature</th>
              <td>{this.state.temperature}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

const Line = ({ stations, sections, color }) => {
  return (
    <Fragment>
      {sections.map((section, i) => (
        <Section
          key={i}
          begin={section.begin}
          end={section.end}
          color={color}
        />
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

  componentDidUpdate(prevProps) {
    if (
      this.props.x !== prevProps.x ||
      this.props.y !== prevProps.y ||
      this.props.style !== prevProps.style ||
      this.props.children !== prevProps.children
    ) {
      this.componentDidMount();
    }
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

const point = (x, y) => ({ x, y });
const section = (begin, end) => ({ begin, end });

const evaluate = lines => {
  let score = 0;

  const sections = lines.flatMap(line => line.sections);
  for (let i = 0; i < sections.length - 1; ++i) {
    for (let j = i + 1; j < sections.length; ++j) {
      if (isCrossing(sections[i], sections[j])) {
        score -= 1;
      }
    }
  }

  return score;
};

const isCrossing = (
  { begin: { x: ax, y: ay }, end: { x: bx, y: by } },
  { begin: { x: cx, y: cy }, end: { x: dx, y: dy } }
) => {
  const ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
  const tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
  const tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
  const td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
  return tc * td < 0 && ta * tb < 0;
};

const modifyLines = (d, maxX, maxY, lines) =>
  lines.map(line => {
    const stations = line.stations.map(station => ({
      ...station,
      x: Math.min(maxX, Math.max(0, station.x + (Math.random() - 0.5) * d)),
      y: Math.min(maxY, Math.max(0, station.y + (Math.random() - 0.5) * d))
    }));
    const sections = calculateSections(stations);
    return {
      ...line,
      stations,
      sections
    };
  });

const calculateSections = stations =>
  stations
    .slice(0, -1)
    .map((station, i) =>
      section(
        point(station.x, station.y),
        point(stations[i + 1].x, stations[i + 1].y)
      )
    );

// vim: set ts=2 sw=2 et:
