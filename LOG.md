# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.08] — 2026-09-10

### Added
+ Centralized CSS design system (`variables.css`) with 18 custom properties for Deep Black theme.
+ Star feature (`optativasFavoritas`) for elective subjects with hours aggregation and cross-tab sync.
+ Abbreviate names feature (`mainAbbreviateNames`) ported from tree view to main page with 30% font boost.
+ Automatic silent reload system via `version.json` detection.
+ Faculty general notices section and email notification subscriptions in Cartelera.
+ Mobile touch-and-hold Floating Action Buttons (FAB) with dark overlay replacing hover actions.
+ Pinch-to-zoom gesture and responsive single-scroll layout in Tree mode.
+ Privacy notice banner across all main pages.

### Changed
+ Rewrote AGENTS.md for clean AI orientation; moved technical details to README.md.
+ Unified navbar font sizes, button heights, and top-bar layout across desktop and mobile.
+ Optimized Cartelera filters, grid card layouts, and edited publication badge tracking.
+ Updated Study Plan (RM 578/25) moving 5th year subjects correctly.

### Fixed
+ State cleanup on subject status change ensuring `cursando` flags clear automatically.
+ SVG connection rendering glitches, arrow flashes, and scroll repositioning issues in Tree mode.
+ Mobile portrait CSS layout, touch targets, and overflow clipping bugs.
+ Cloudflare Worker HTML parser regex for robust email notifications without browser DOMParser.

### Removed
+ Dead `evidencia` property and unused legacy abbreviation dictionaries.
+ Redundant zoom controls and container wrappers in single-scroll Tree mode architecture.
