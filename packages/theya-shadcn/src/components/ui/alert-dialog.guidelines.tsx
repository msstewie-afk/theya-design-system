import { C, type ComponentGuidelines } from '@/docs/guidelines';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';

export const alertDialogGuidelines: ComponentGuidelines = {
  status: 'stable',
  whenToUse: ['Confirming one deliberate, usually destructive or irreversible action before it happens.', 'Interrupting is justified: losing data, money or access.'],
  whenNotToUse: [
    { text: 'Reversible actions', instead: 'do it and offer Undo (UndoToast)' },
    { text: 'Deletes people should type the name to confirm', instead: 'ConfirmDialog' },
    { text: 'Forms or anything to read at length', instead: 'Dialog' },
  ],
  anatomy: [
    { part: 'Title', description: 'the question with the object: “Delete shop.seashell.dev?”.' },
    { part: 'Description', description: 'what will happen and what can’t be undone.' },
    { part: 'Actions', description: <><C>AlertDialogCancel</C> and <C>AlertDialogAction</C> labelled with the verb (“Delete site”), danger tone for destructive.</> },
  ],
  doDont: [
    {
      do: {
        example: (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button appearance="outlined" tone="danger" size="md">Delete site</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete shop.seashell.dev?</AlertDialogTitle>
                <AlertDialogDescription>Its files, databases and 14 backups are removed. This can’t be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete site</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
        caption: 'Open it: the title names the object, the button names the action.',
      },
      dont: {
        example: (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button appearance="outlined" tone="danger" size="md">Delete site</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>Please confirm.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No</AlertDialogCancel>
                <AlertDialogAction>Yes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ),
        caption: '“Are you sure? Yes / No” — sure about what, and what does Yes do?',
      },
    },
  ],
  a11y: [
    <>It’s an <C>alertdialog</C>: focus starts on Cancel (the safe choice), Escape cancels, focus returns to the trigger.</>,
    'Title and description are read when it opens — put the consequence there, not in the button.',
  ],
};
