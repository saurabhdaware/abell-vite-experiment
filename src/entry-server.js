import fs from 'fs';
import { render as abellRenderToString } from 'abell-renderer';

export async function render(abellFilePath) {
  let abellText;
  if (process.env.NODE_ENV === 'production') {
    abellText = fs.readFileSync(abellFilePath, 'utf-8');
  } else {
    abellText = (await import(abellFilePath + '?raw')).default;
  }

  return abellRenderToString(abellText);
}