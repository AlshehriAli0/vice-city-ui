import { Component, Suspense, type ReactNode } from "react";

class DemoBoundary extends Component<{ name: string; children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render(): ReactNode {
    if (!this.state.failed) return <Suspense fallback={this.props.fallback}>{this.props.children}</Suspense>;
    return <p className="demo-failed">{this.props.name} couldn&apos;t render.</p>;
  }
}

export { DemoBoundary };
