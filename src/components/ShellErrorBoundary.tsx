import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class ShellErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("trijbOS shell crash", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="boot-screen is-error">
          <div className="boot-message">
            <strong>trijbOS failed to start.</strong>
            <span>{this.state.message}</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
