import * as React from "react";
import { BACKGROUND_COLOR } from "./constants";

type Props = {
  x: number;
  y: number;
  style: { [k: string]: string };
  stroke: string;
  children?: JSX.Element | string;
};

type State = { rectProps: {} | null };

export default class BorderedText extends React.Component<Props, State> {
  text: React.RefObject<SVGTextElement>;

  constructor(props: Props) {
    super(props);
    this.text = React.createRef();
    this.state = {
      rectProps: null
    };
  }

  componentDidMount() {
    if (this.text.current === null) return;

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

  componentDidUpdate(prevProps: Props) {
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
      <React.Fragment>
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
      </React.Fragment>
    );
  }
}

// vim: set ts=2 sw=2 et:
