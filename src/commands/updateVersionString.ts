import { TextEditor, TextLine } from 'vscode'
import { Dependency } from '../dependencies'

export default function updateVersionString(editor: TextEditor, documentLine: TextLine, dependency: Dependency) {
  const split = documentLine.text.split(':')

  if (split.length >= 2) {
    const comma = documentLine.text.endsWith(',') ? ',' : ''
    const quote = editor.document.fileName.endsWith('json') ? '"' : ''
    const updatedVersion = dependency.getRangeString()
    if (!updatedVersion) return
    const updatedText = `${split[0]}: ${quote}${updatedVersion}${quote}${comma}`
    editor.edit((e) => {
      e.replace(documentLine.range, updatedText)
    })
  }
}
