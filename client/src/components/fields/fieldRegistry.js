import Checkbox from './Checkbox';
import Select from './Select';
import TextInput from './TextInput';

const fieldRegistry = {
  text: TextInput,
  select: Select,
  checkbox: Checkbox,
};

export function getFieldComponent(type) {
  return fieldRegistry[type] ?? null;
}
