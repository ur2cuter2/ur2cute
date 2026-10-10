// Generated from schemas/chapter.schema.json; equality checked by tests.
export const chapterSchema = {
 "$schema":"https://json-schema.org/draft/2020-12/schema","$id":"urn:taiga:chapter:1.0","title":"大河ヒストリア 章マスタ","type":"object","additionalProperties":false,
 "required":["schemaVersion","chapterId","chapterName","contentVersion","sourceQuestions","passages"],
 "properties":{
  "schemaVersion":{"const":"1.0"},"chapterId":{"$ref":"#/$defs/string"},"chapterName":{"$ref":"#/$defs/string"},"contentVersion":{"$ref":"#/$defs/string"},"sample":{"type":"boolean"},"sourceNote":{"$ref":"#/$defs/string"},
  "sourceQuestions":{"type":"array","minItems":1,"items":{"type":"object","additionalProperties":false,"required":["id","question","answer","acceptedAnswers"],"properties":{"id":{"$ref":"#/$defs/string"},"question":{"$ref":"#/$defs/string"},"answer":{"$ref":"#/$defs/string"},"acceptedAnswers":{"type":"array","uniqueItems":true,"items":{"$ref":"#/$defs/string"}}}}},
  "passages":{"type":"array","minItems":2,"items":{"type":"object","additionalProperties":false,"required":["id","half","order","title","text","blanks"],"properties":{"id":{"$ref":"#/$defs/string"},"half":{"enum":["first","second"]},"order":{"type":"integer","minimum":1},"title":{"$ref":"#/$defs/string"},"text":{"$ref":"#/$defs/string"},"blanks":{"type":"array","minItems":1,"maxItems":4,"items":{"type":"object","additionalProperties":false,"required":["id","sourceId"],"properties":{"id":{"$ref":"#/$defs/string"},"sourceId":{"$ref":"#/$defs/string"}}}}}}}
 },"$defs":{"string":{"type":"string","minLength":1,"pattern":"\\S"}}
};
