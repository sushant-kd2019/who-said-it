# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [1.1.0] - 2026-01-09

### Bug Fixes

- **State Resume Fix** ([#2](https://github.com/sushant-kd2019/who-said-it/pull/2))
  - Fixed game state resumption when players leave and rejoin the game
  - Enhanced socket communication to send relevant data during voting, results, and finished phases
  - Players can now properly rejoin ongoing games without losing their progress

### Features

- **Questions System Overhaul** ([#1](https://github.com/sushant-kd2019/who-said-it/pull/1))
  - Implemented new question seeding functionality with a pool of 1000+ curated questions
  - Added usage tracking to prevent question repetition within sessions
  - Added question pool management for better game variety
  - Updated Question and Room models to support new features
  - Deprecated old hardcoded question templates in favor of database-driven questions

---

## [1.0.0] - Initial Release

### Features

- Real-time multiplayer party game with Socket.IO
- Create and join game rooms with shareable codes
- Answer creative questions about other players
- Anonymous voting system for best answers
- Point-based scoring with leaderboards
- Leave room functionality with animated menu in Answer, Results, and Voting phases
- Responsive UI built with React, TypeScript, and Tailwind CSS

### Infrastructure

- Backend deployed on Render
- Frontend deployed on Cloudflare Pages
- MongoDB database for persistent storage
- TypeScript support throughout the codebase

