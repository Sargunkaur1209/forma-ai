import Checkbox from './Checkbox';
import NumberInput from './NumberInput';
import Select from './Select';
import TextInput from './TextInput';

const fieldRegistry = {
  text: TextInput,
  number: NumberInput,
  select: Select,
  checkbox: Checkbox,
};

export function getFieldComponent(type) {
  return fieldRegistry[type] ?? null;
}
