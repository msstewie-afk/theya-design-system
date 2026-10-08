import { C, type ComponentGuidelines } from '../../docs/guidelines';
import { Terminal } from './terminal';
import { CodeBlock } from './code-block';

export const terminalGuidelines: ComponentGuidelines = {
  status: 'beta',
  whenToUse: [
    'Live or past console output: a web SSH session, a deploy or build log, a tail of access logs.',
    'Output where the order and severity of lines matter.',
  ],
  whenNotToUse: [
    { text: 'A command for the user to copy', instead: 'CodeBlock' },
    { text: 'A list of events people browse or filter', instead: 'Timeline or DataTable' },
    { text: 'Editable code', instead: 'CodeEditor' },
  ],
  anatomy: [
    { part: 'Header', description: <>connection dot + label, <C>user@host</C>, status text and a <C>tools</C> slot.</>, optional: true },
    { part: 'Body', description: 'scrollback log; follows new lines only while the reader is at the bottom.' },
    { part: 'Line', description: <>one line of output; <C>level</C> sets the color (cmd, success, warning, error, muted).</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <div className="w-80">
            <Terminal hideHeader lines={[
              { id: '1', text: '$ npm run build', level: 'cmd' },
              { id: '2', text: 'warning: 2 unused exports', level: 'warning' },
              { id: '3', text: 'error: build failed (exit 1)', level: 'error' },
            ]} />
          </div>
        ),
        caption: 'Levels color the lines, and the text itself says “warning” / “error”.',
      },
      dont: {
        example: <div className="w-80"><CodeBlock language="bash" code={'$ npm run build\nwarning: 2 unused exports\nerror: build failed (exit 1)'} /></div>,
        caption: 'A static code block for a log: no severity, no following new output.',
      },
    },
  ],
  a11y: [
    <>The body is <C>role="log"</C> and a tab stop; new lines are announced politely. For chatty streams set <C>live="off"</C> and announce only the result.</>,
    'Connection state is a dot plus a text label, never color alone.',
    <>Give each terminal on a page its own <C>ariaLabel</C> (“Deploy log”, “SSH: web-04”).</>,
    'Line colors come from tokens that pass contrast on the dark surface — don’t override them with raw ANSI colors.',
  ],
};
