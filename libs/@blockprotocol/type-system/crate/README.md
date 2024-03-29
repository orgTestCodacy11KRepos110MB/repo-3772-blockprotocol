# The Block Protocol Type-System

[//]: # "TODO: Introduction"

## Overview

![](./assets/overview.png)

## Requirements

- [Rust](https://www.rust-lang.org/tools/install)
- [cargo-make](https://github.com/sagiegurari/cargo-make#installation)

## Building the package

- `cargo make build` - Compiles the Rust crate, and generates `@blockprotocol/type-system` npm package (located in parent folder)

For more granular task control look at `cargo make --list-all-steps`

## Running tests

- `cargo make test` - Runs the unit tests and headless WASM integration tests found in the [./src/tests](./src/tests) directory.
