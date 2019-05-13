import * as React from "react";
import { sum } from "lodash";

import BorderedText from "./BorderedText";
import data from "./data";
import { BORDER_COLOR, FONT_FAMILY, LINE_WIDTH } from "./constants";
import * as types from "./types";

type Props = {
  width: number;
  height: number;
};

type State = {
  viewBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  lines: types.Line[];
  score: number;
  temperature: number;
};

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
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
            <Line key={i} {...line} />
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

const Line = ({ stations, sections, color }: types.Line) => {
  return (
    <React.Fragment>
      {sections.map((section, i) => (
        <Section
          key={i}
          begin={section.begin}
          end={section.end}
          color={color}
        />
      ))}
      {stations.map((station, i) => (
        <Station key={i} {...station} />
      ))}
    </React.Fragment>
  );
};

const Station = ({ name, x, y }: types.Station) => (
  <BorderedText
    x={x}
    y={y}
    stroke={BORDER_COLOR}
    style={{ fontFamily: FONT_FAMILY }}
  >
    {name}
  </BorderedText>
);

const Section = ({ color, begin, end }: types.Section) => (
  <line
    x1={begin.x}
    y1={begin.y}
    x2={end.x}
    y2={end.y}
    stroke={color}
    strokeWidth={LINE_WIDTH}
  />
);

const evaluate = (lines: types.Line[]) => {
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

const point = (x: number, y: number) => ({ x, y });
const segment = (begin: types.Point, end: types.Point) => ({ begin, end });

const isCrossing = (
  { begin: { x: ax, y: ay }, end: { x: bx, y: by } }: types.Segment,
  { begin: { x: cx, y: cy }, end: { x: dx, y: dy } }: types.Segment
) => {
  const ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
  const tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
  const tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
  const td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);
  return tc * td < 0 && ta * tb < 0;
};

const modifyLines = (
  d: number,
  maxX: number,
  maxY: number,
  lines: types.Line[]
) =>
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

const calculateSections = (stations: types.Station[]) =>
  stations
    .slice(0, -1)
    .map((station, i) =>
      segment(
        point(station.x, station.y),
        point(stations[i + 1].x, stations[i + 1].y)
      )
    );

// vim: set ts=2 sw=2 et:
