import util from './utils/util';
import accumulation from './expression-modifiers/accumulation';
import measureBase from './base';
import accumulationProperties from './expression-modifiers/accumulation-properties';
// import translator from '../../../../js/lib/translator';

// TODO: make this modifier agnostic (should be able to list all modifiers in a generic way)

const translator = {
  get(key) {
    return key;
  },
};

const FIRST_MODIFIER_REF = 'qDef.modifiers.0';

const modifiersProperties = {
  type: 'items',
  component: 'items',
  delimited: true,
  label(itemData) {
    const modifier = util.getValue(itemData, FIRST_MODIFIER_REF);
    const modifierType = modifier && !modifier.disabled && modifier.type; // TODO: get translation for modifier
    return translator.get('$Modifier') + (modifierType ? ` (${modifierType})` : ''); // TODO: Do not use translator in this way (translator module not available)
  },
  show(data, handler, args) {
    const modifiers = util.getValue(args, 'ext.support.modifiers');
    return modifiers && modifiers[0] === 'accumulation';
  },
  items: {
    dropDown: {
      ref: `${FIRST_MODIFIER_REF}.disabled`,
      type: 'boolean',
      component: 'dropdown',
      defaultValue: true,
      options: [
        {
          value: true,
          translation: 'Common.None',
        },
        {
          value: false,
          translation: '$Accumulation',
        },
      ],
      change(itemData) {
        const modifier = util.getValue(itemData, FIRST_MODIFIER_REF);
        accumulation.initModifier(modifier);
        if (modifier.disabled) {
          measureBase.restoreBase(itemData);
        } else {
          measureBase.initBase(itemData, true);
        }
      },
    },
    ...accumulationProperties(FIRST_MODIFIER_REF),
    showExpression: {
      type: 'items',
      component: 'expandable-light',
      translation: '$Show output expression$',
      show(itemData) {
        const modifier = util.getValue(itemData, FIRST_MODIFIER_REF);
        return modifier && !modifier.disabled;
      },
      items: {
        expression: {
          ref: `${FIRST_MODIFIER_REF}.outputExpression.qValueExpression.qExpr`,
          type: 'string',
          component: 'textarea',
          readOnly: () => true,
        },
      },
    },
  },
};

export default modifiersProperties;
