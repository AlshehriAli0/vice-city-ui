import { Component, type ReactNode } from "react";

class DemoBoundary extends Component<{ name: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return <p className="demo-failed">{this.props.name} couldn&apos;t render.</p>;
  }
}

export { DemoBoundary };
