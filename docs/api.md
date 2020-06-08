<a name="module_Modifiers"></a>

## Modifiers

* [Modifiers](#module_Modifiers)
    * [.modifiers](#module_Modifiers.modifiers) : <code>Object</code>
    * [.measureBase](#module_Modifiers.measureBase)
        * [.getExpression(measure)](#module_Modifiers.measureBase.getExpression) ⇒ <code>string</code>
        * [.getExpressionRef(measure)](#module_Modifiers.measureBase.getExpressionRef) ⇒ <code>string</code>
        * [.getLibraryIdRef(measure)](#module_Modifiers.measureBase.getLibraryIdRef) ⇒ <code>string</code>
        * [.getLibraryId(measure)](#module_Modifiers.measureBase.getLibraryId) ⇒ <code>string</code>
        * [.getLabelRef(measure)](#module_Modifiers.measureBase.getLabelRef) ⇒ <code>string</code>
        * [.getLabelExpressionRef(measure)](#module_Modifiers.measureBase.getLabelExpressionRef) ⇒ <code>string</code>
    * [.initBase(measure, hardSet)](#module_Modifiers.initBase)
    * [.apply(options)](#module_Modifiers.apply) ⇒ <code>Promise</code>
    * [.applyModifiers(options)](#module_Modifiers.applyModifiers) ⇒ <code>Promise</code>
    * [.cleanUpMeasure(measure)](#module_Modifiers.cleanUpMeasure)
    * [.destroy(model)](#module_Modifiers.destroy)
    * [.hasActiveModifiers(options)](#module_Modifiers.hasActiveModifiers) ⇒ <code>Boolean</code>
    * [.limitedSorting(options)](#module_Modifiers.limitedSorting)
    * [.getActiveModifier(measure)](#module_Modifiers.getActiveModifier)
    * [.ifEnableTotalsFunction(measure)](#module_Modifiers.ifEnableTotalsFunction)

<a name="module_Modifiers.modifiers"></a>

### Modifiers.modifiers : <code>Object</code>
An object literal containing all available modifiers

**Kind**: static property of [<code>Modifiers</code>](#module_Modifiers)  
<a name="module_Modifiers.measureBase"></a>

### Modifiers.measureBase
Utility functions for accessing input/base properties of a measure

**Kind**: static constant of [<code>Modifiers</code>](#module_Modifiers)  

* [.measureBase](#module_Modifiers.measureBase)
    * [.getExpression(measure)](#module_Modifiers.measureBase.getExpression) ⇒ <code>string</code>
    * [.getExpressionRef(measure)](#module_Modifiers.measureBase.getExpressionRef) ⇒ <code>string</code>
    * [.getLibraryIdRef(measure)](#module_Modifiers.measureBase.getLibraryIdRef) ⇒ <code>string</code>
    * [.getLibraryId(measure)](#module_Modifiers.measureBase.getLibraryId) ⇒ <code>string</code>
    * [.getLabelRef(measure)](#module_Modifiers.measureBase.getLabelRef) ⇒ <code>string</code>
    * [.getLabelExpressionRef(measure)](#module_Modifiers.measureBase.getLabelExpressionRef) ⇒ <code>string</code>

<a name="module_Modifiers.measureBase.getExpression"></a>

#### measureBase.getExpression(measure) ⇒ <code>string</code>
Get the qDef property - from the base if it exists, otherwise returns qDef.qDef of the measure

**Kind**: static method of [<code>measureBase</code>](#module_Modifiers.measureBase)  
**Returns**: <code>string</code> - The original/input expression  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array) |

<a name="module_Modifiers.measureBase.getExpressionRef"></a>

#### measureBase.getExpressionRef(measure) ⇒ <code>string</code>
Get path to expression (e.g. "qDef.qDef")

**Kind**: static method of [<code>measureBase</code>](#module_Modifiers.measureBase)  
**Returns**: <code>string</code> - Reference to the the original/input expression property (qDef)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array) |

<a name="module_Modifiers.measureBase.getLibraryIdRef"></a>

#### measureBase.getLibraryIdRef(measure) ⇒ <code>string</code>
Get path to the qLibraryId property - from the base if it exists, otherwise from the measure as normal

**Kind**: static method of [<code>measureBase</code>](#module_Modifiers.measureBase)  
**Returns**: <code>string</code> - Reference to the original/input libraryId property (qLibraryId)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array) |

<a name="module_Modifiers.measureBase.getLibraryId"></a>

#### measureBase.getLibraryId(measure) ⇒ <code>string</code>
Get the qLibraryId property - from the base if it exists, otherwise returns qLibraryId of the measure

**Kind**: static method of [<code>measureBase</code>](#module_Modifiers.measureBase)  
**Returns**: <code>string</code> - The original/input libraryId  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array) |

<a name="module_Modifiers.measureBase.getLabelRef"></a>

#### measureBase.getLabelRef(measure) ⇒ <code>string</code>
Get the qLabel property - from the base if it exists, otherwise returns qLabel of the measure

**Kind**: static method of [<code>measureBase</code>](#module_Modifiers.measureBase)  
**Returns**: <code>string</code> - Reference to the original/input label property (qLabel)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array) |

<a name="module_Modifiers.measureBase.getLabelExpressionRef"></a>

#### measureBase.getLabelExpressionRef(measure) ⇒ <code>string</code>
Get the qLabelExpression property - from the base if it exists, otherwise returns qLabelExpression of the measure

**Kind**: static method of [<code>measureBase</code>](#module_Modifiers.measureBase)  
**Returns**: <code>string</code> - Reference to the original/input labelExpression property (qLabelExpression)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array) |

<a name="module_Modifiers.initBase"></a>

### Modifiers.initBase(measure, hardSet)
Initialize the base for a measure - Creates a base object literal with the original qDef.qDef and qLibrary properties.

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | Properties for a measure in a hypercube def (from qHyperCubeDef.qMeasures array) |
| hardSet | <code>Boolean</code> | force initialize base |

<a name="module_Modifiers.apply"></a>

### Modifiers.apply(options) ⇒ <code>Promise</code>
Applies defined modifiers to measures in hypercubeDef
(!subscribes to master items layout changes, call destroy function to unsubscribe)

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  
**Returns**: <code>Promise</code> - Promise resolving with a boolean - modified: true/false (true if a setProperties or applyPatches has run)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | An object with all input parameters |
| options.model | <code>Object</code> |  | Enigma model of the object fetched from engine (mandatory) |
| [options.properties] | <code>Object</code> |  | object properties. |
| [options.isSnapshot] | <code>boolean</code> | <code>false</code> | is it a snapshot or not? |
| [options.masterItem] | <code>Object</code> |  | layout of master item |

<a name="module_Modifiers.applyModifiers"></a>

### Modifiers.applyModifiers(options) ⇒ <code>Promise</code>
Applies defined modifiers to measures in hypercubeDef
(!subscribes to master items layout changes, call destroy function to unsubscribe)

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  
**Returns**: <code>Promise</code> - Promise resolving with a boolean - modified: true/false (true if a setProperties or applyPatches has run)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | An object with all input parameters |
| options.model | <code>Object</code> |  | Enigma model of the object fetched from engine (mandatory) |
| [options.properties] | <code>Object</code> |  | Object properties |
| [options.measures] | <code>Array.&lt;Object&gt;</code> |  | An array of measure properties |
| [options.runUpdateIfChange] | <code>boolean</code> | <code>false</code> | Wether of not properties should be persisted (soft patched when readonly access) |
| [options.masterItem] | <code>Object</code> |  | layout of master item |

<a name="module_Modifiers.cleanUpMeasure"></a>

### Modifiers.cleanUpMeasure(measure)
Restores the measure properties to how it was before modifiers were applied

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | The measure properties object from the enigma model |

<a name="module_Modifiers.destroy"></a>

### Modifiers.destroy(model)
Removes layout subscribers (listeners for master items).
Make sure to run this when not using the object any longer to avoid memory leaks.

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>Object</code> | Enigma model of the object fetched from engine (mandatory) |

<a name="module_Modifiers.hasActiveModifiers"></a>

### Modifiers.hasActiveModifiers(options) ⇒ <code>Boolean</code>
Checks if there is some active modifier in any of the provided measures

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  
**Returns**: <code>Boolean</code> - true if the there are any active modifiers  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | An object with all input parameters |
| options.measures | <code>Array.&lt;Object&gt;</code> | Array with measure properties or layout |
| [options.properties] | <code>Object</code> | object properties (needs either this or the layout) |
| [options.layout] | <code>Object</code> | object layout (needs either this or the properties) |

<a name="module_Modifiers.limitedSorting"></a>

### Modifiers.limitedSorting(options)
Is sorting capabilities limited due to applied modifier?
Can operate either on layout or properties

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | An object with all input parameters |
| options.measures | <code>Array.&lt;Object&gt;</code> | Array with measure properties or layout |
| [options.properties] | <code>Object</code> | object properties (needs either this or the layout) |
| [options.layout] | <code>Object</code> | object layout (needs either this or the properties) |

<a name="module_Modifiers.getActiveModifier"></a>

### Modifiers.getActiveModifier(measure)
Get active modifier

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | The measure properties object |

<a name="module_Modifiers.ifEnableTotalsFunction"></a>

### Modifiers.ifEnableTotalsFunction(measure)
Check if one type of modifier should enable totals function in table

**Kind**: static method of [<code>Modifiers</code>](#module_Modifiers)  

| Param | Type | Description |
| --- | --- | --- |
| measure | <code>Object</code> | The measure properties object |

