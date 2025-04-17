// This file provides backward compatibility during the transition
// from a single db.ts file to modular files.
// It re-exports all types and functions from the new modular files.

export * from "./auth";
export * from "./verse";
export * from "./reflection";

// Over time, components should update their imports to use the specific files directly:
// import { saveReflection } from '@/actions/reflection';
// instead of:
// import { saveReflection } from '@/actions/db';
// or:
// import { saveReflection } from '@/actions';
