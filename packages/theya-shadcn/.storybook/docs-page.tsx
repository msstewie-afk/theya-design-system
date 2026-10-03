/**
 * Autodocs page template: the standard blocks, plus use-guidelines from
 * `parameters.guidelines` when the component has them (see
 * src/docs/guidelines.tsx). Pages without guidelines look exactly as
 * before.
 */
import { Controls, Description, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import { GuidelinesDetails, GuidelinesIntro, type ComponentGuidelines } from '../src/docs/guidelines';

export function DocsPage() {
  const resolved = useOf('meta');
  const guidelines = (resolved.type === 'meta' ? resolved.preparedMeta.parameters?.guidelines : undefined) as ComponentGuidelines | undefined;
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      {guidelines && <GuidelinesIntro guidelines={guidelines} />}
      <Primary />
      <Controls />
      <Stories />
      {guidelines && <GuidelinesDetails guidelines={guidelines} />}
    </>
  );
}
