/**
 * Core registry: Strategy enum, Arg/CliCommand interfaces, cli() registration.
 */

import type { IPage } from './types.js';

export enum Strategy {
  PUBLIC = 'public',
  COOKIE = 'cookie',
  HEADER = 'header',
  INTERCEPT = 'intercept',
  UI = 'ui',
}

export interface Arg {
  name: string;
  type?: string;
  default?: unknown;
  required?: boolean;
  positional?: boolean;
  help?: string;
  choices?: string[];
}

export interface CliCommand {
  site: string;
  name: string;
  description: string;
  domain?: string;
  strategy?: Strategy;
  browser?: boolean;
  args: Arg[];
  columns?: string[];
  func?: (page: IPage, kwargs: Record<string, any>, debug?: boolean) => Promise<unknown>;
  pipeline?: Record<string, unknown>[];
  timeoutSeconds?: number;
  source?: string;
  footerExtra?: (kwargs: Record<string, any>) => string | undefined;
}

/** Internal extension for lazy-loaded TS modules (not exposed in public API) */
export interface InternalCliCommand extends CliCommand {
  _lazy?: boolean;
  _modulePath?: string;
}
export interface CliOptions extends Partial<Omit<CliCommand, 'args' | 'description'>> {
  site: string;
  name: string;
  description?: string;
  args?: Arg[];
}
const _registry = new Map<string, CliCommand>();

export function cli(opts: CliOptions): CliCommand {
  const strategy = opts.strategy ?? (opts.browser === false ? Strategy.PUBLIC : Strategy.COOKIE);
  const browser = opts.browser ?? (strategy !== Strategy.PUBLIC);
  const cmd: CliCommand = {
    site: opts.site,
    name: opts.name,
    description: opts.description ?? '',
    domain: opts.domain,
    strategy,
    browser,
    args: opts.args ?? [],
    columns: opts.columns,
    func: opts.func,
    pipeline: opts.pipeline,
    timeoutSeconds: opts.timeoutSeconds,
    footerExtra: opts.footerExtra,
  };

  const key = fullName(cmd);
  _registry.set(key, cmd);
  return cmd;
}

export function getRegistry(): Map<string, CliCommand> {
  return _registry;
}

export function fullName(cmd: CliCommand): string {
  return `${cmd.site}/${cmd.name}`;
}

export function strategyLabel(cmd: CliCommand): string {
  return cmd.strategy ?? 'public';
}

export function registerCommand(cmd: CliCommand): void {
  _registry.set(fullName(cmd), cmd);
}

// ── Serialization helpers (shared by list, --help, manifest) ────────────────

export type SerializedArg = {
  name: string;
  type: string;
  required: boolean;
  positional: boolean;
  choices: string[];
  default: unknown;
  help: string;
};

/** Stable arg schema — every field is always present (no sparse objects). */
export function serializeArg(a: Arg): SerializedArg {
  return {
    name: a.name,
    type: a.type ?? 'string',
    required: !!a.required,
    positional: !!a.positional,
    choices: a.choices ?? [],
    default: a.default ?? null,
    help: a.help ?? '',
  };
}

/** Full command metadata for structured output (json/yaml). */
export function serializeCommand(cmd: CliCommand) {
  return {
    command: fullName(cmd),
    site: cmd.site,
    name: cmd.name,
    description: cmd.description,
    strategy: strategyLabel(cmd),
    browser: !!cmd.browser,
    args: cmd.args.map(serializeArg),
    columns: cmd.columns ?? [],
    domain: cmd.domain ?? null,
  };
}

/** Human-readable arg summary: `<required> [optional]` style. */
export function formatArgSummary(args: Arg[]): string {
  return args
    .map(a => {
      if (a.positional) return a.required ? `<${a.name}>` : `[${a.name}]`;
      return a.required ? `--${a.name}` : `[--${a.name}]`;
    })
    .join(' ');
}

/** Generate the --help appendix showing registry metadata not exposed by Commander. */
export function formatRegistryHelpText(cmd: CliCommand): string {
  const lines: string[] = [];
  const choicesArgs = cmd.args.filter(a => a.choices?.length);
  for (const a of choicesArgs) {
    const prefix = a.positional ? `<${a.name}>` : `--${a.name}`;
    const def = a.default != null ? `  (default: ${a.default})` : '';
    lines.push(`  ${prefix}: ${a.choices!.join(', ')}${def}`);
  }
  const meta: string[] = [];
  meta.push(`Strategy: ${strategyLabel(cmd)}`);
  meta.push(`Browser: ${cmd.browser ? 'yes' : 'no'}`);
  if (cmd.domain) meta.push(`Domain: ${cmd.domain}`);
  lines.push(meta.join(' | '));
  if (cmd.columns?.length) lines.push(`Output columns: ${cmd.columns.join(', ')}`);
  return '\n' + lines.join('\n') + '\n';
}
