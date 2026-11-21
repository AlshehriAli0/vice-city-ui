import { Component, type ReactNode } from "react"

/* Keeps one failing demo from taking the whole catalogue down with it. */
class DemoBoundary extends Component<{ name: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children
    return <p className="demo-failed">{this.props.name} couldn't render.</p>
  }
}

export { DemoBoundary }
