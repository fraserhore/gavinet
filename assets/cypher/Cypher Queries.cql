

// CREATE (CONTENT) - Add a ContentObject IdentityNode and Version node
// Match the parent node
MATCH (parent)
WHERE id(parent)=19
// Create the new child content object's identity and version nodes and their relationships
CREATE parent-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(childidentity:IdentityNode:ContentObject)-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(childversion:Version)
// Set the content object's type as a label on the identity node
SET childidentity:Folder
// Set the content object's properties
SET childversion = {name:"Folder Name", description:"This is a description"}
// Set the identity node name
SET childidentity.name = childversion.name
// Return the newly created nodes
RETURN parent,childidentity,childversion

// UPDATE (CONTENT) - Add a Version node
MATCH (identitynode)-[currentversionrelationship:VERSION {to:9007199254740991}]->(currentversion)
WHERE id(identitynode)=3 AND currentversionrelationship.lang = "en-gb"
// Update the current version relationship to end validity
SET currentversionrelationship.to = timestamp()
// Create the new version relationship and node
CREATE identitynode-[newversionrelationship:VERSION {from:timestamp(), to:9007199254740991}]->(newversion:Version)
// Set new version relationship properties
SET newversionrelationship.versionNumber = toInt(currentversionrelationship.versionNumber) + 1
SET newversionrelationship.versionName = ""
SET newversionrelationship.lang = currentversionrelationship.lang
// Set new version node properties
SET newversion = currentversion
SET newversion.name = "New Name"
//... update more newversion properties
// Update the identity node
SET identitynode.name = newversion.name
// Create a previous relationship from the new version to the previous version
CREATE newversion-[:PREVIOUS]->currentversion
// Return the affected nodes
RETURN identitynode,currentversion,newversion

// UPDATE (LOCATION - MOVE) - Change a location / parent node
// Match the current parent, child and new parent nodes
MATCH (currentparent)-[relationship:CONTAINS]->(child), (newparent)
WHERE id(currentparent)=19 AND id(child)=31 AND id(newparent)=25
// End validity of relationship to current parent
SET relationship.to = timestamp()
// Create the new parent->child relationship
CREATE newparent-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(child)
// Return the newly created nodes
RETURN currentparent, newparent, child

// UPDATE (LOCATION - ADD) - Add a location / parent node
// Match the parent and child  nodes
MATCH (parent),(child)
WHERE id(parent)=19 AND id(child)=31
// Create the new parent->child relationship
CREATE parent-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(child)
// Return the newly created nodes
RETURN parent,child

// DELETE - Remove a location / parent node
// Match the parent and child  nodes
MATCH (parent)-[relationship:CONTAINS]->(child)
WHERE id(parent)=29 AND id(child)=31
// End validity of relationship
SET relationship.to = timestamp()
// Return the newly created nodes
RETURN parent,child

// Delete a Node (and its relationships)
// Since you can’t have relationships that don’t either start or end with a node, you have to remove relationships before you remove a node.
MATCH (n)
WHERE id(n) = id_of_node_to_delete
OPTIONAL MATCH (n)-[r]-() DELETE n,r

// READ - get all nodes
MATCH (n) RETURN n

// READ - Get by ID, current version
MATCH (a)-[:VERSION {to:9007199254740991, lang:"en-gb"}]->(b)
WHERE id(a) = 1
RETURN a as IdentityNode, b as VersionNode

// READ - Get by ID, current version
MATCH (a)-[version:VERSION]->(b)
WHERE id(a) = 1 AND version.to = 9007199254740991 AND version.lang = "en-gb"
RETURN a as IdentityNode, version as Version, b as VersionNode

// READ - Get by ID, version by validity date i.e. valid on this date
MATCH (a)-[version:VERSION]->(b)
WHERE id(a) = 1 AND (version.from <= 1445026904965 AND version.to > 1445026904965) AND version.lang = "en-gb"
RETURN a as IdentityNode, b as VersionNode

// READ - Get version by name
MATCH (a)-[:VERSION {versionName:"Initial", lang:"en-gb"}]->(b)
WHERE id(a) = 1
RETURN a as IdentityNode, b as VersionNode

// READ - Get version by number
MATCH (a)-[:VERSION {versionNumber:1, lang:"en-gb"}]->(b)
WHERE id(a) = 1
RETURN a as IdentityNode, b as VersionNode

// READ - Get child nodes
MATCH (a)-[r:CONTAINS {to:9007199254740991}]->(b)-[:VERSION {to:9007199254740991}]->(c)
WHERE id(a) = 1
RETURN b as IdentityNode, c as VersionNode

// READ - Get Subtree
MATCH (a)-[r:CONTAINS* {to:9007199254740991}]->(b), b-[:VERSION {to:9007199254740991}]-(c)
WHERE id(a) = 1
RETURN a,b,c

// READ - Get Subtree 2
MATCH (a)-[r:CONTAINS* {to:9007199254740991}]->(b)
WHERE id(a) = 1
RETURN a,r,b

// READ - Get Subtree 3
MATCH path = (a)-[r:CONTAINS* {to:9007199254740991}]->(b)
WHERE id(a) = 1 AND not(b-[:CONTAINS{to:9007199254740991}]->())
RETURN path

// READ - Get Subtree 4
MATCH (a)-[r:CONTAINS* {to:9007199254740991}]->(b)
WHERE id(a) = 1
WITH b
MATCH (a)-[r:CONTAINS {to:9007199254740991}]->b-[:VERSION {to:9007199254740991}]-(c)
RETURN a,b,c

// READ - Get Subtree 5
// This is also an example of using the rest API.
:POST /db/data/transaction/commit
{
  "statements" : [ {
    "statement" : "MATCH (a)-[r:CONTAINS|VERSION* {to:9007199254740991}]->(b) WHERE id(a) = 1 RETURN COLLECT(b), COLLECT(r)",
    "resultDataContents" : [ "graph" ]
  } ]
}

// Output Data as JSON
// This is also an example of using the rest API.
:POST /db/data/transaction/commit
{
  "statements" : [ {
    "statement" : "MATCH (n)-[r]-() RETURN COLLECT(n), COLLECT(r)",
    "resultDataContents" : [ "graph" ]
  } ]
}

// 	CREATE (CONTENT TYPE) - Add Content Type
MATCH (n:ContentTypes)
CREATE (n)-[:INCLUDES]->(m:ContentType {name:""})

// UPDATE (CONTENT TYPE) - Add ContentType Properties
MATCH (contenttype:ContentType {name:"ContentType"}), (properties:Properties)
CREATE (contenttype)-[:HAS_PROPERTY]->(property:Property {name:"PropertyName", type:""})<-[:INCLUDES]-(properties)
return contenttype, property, properties

// Show ContentTypes
MATCH (contenttypes:ContentTypes)-[r]->(contenttype)
RETURN contenttypes,contenttype

// Show a ContentType and its Properties
MATCH (contenttype:ContentType {name:"Folder"})-[:HAS_PROPERTY]->(property)
RETURN contenttype, property



// CREATE (ROOT NODES)
//Create Root node
CREATE (root:Identity:Root {name:"Root"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(version:Version {name:"Root", description:"This is the root node for the application"})

// Create sub-nodes
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(contenttypes:Identity:ContentTypes {uuid:"", contentType:"content_types", name:"ContentTypes"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"ContentTypes", description:"Container for content type definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(propertytypes:Identity:PropertyTypes {uuid:"", contentType:"property_types", name:"Property Types"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Property Types", description:"Container for content type property type definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(datatypes:Identity:DataTypes {uuid:"", contentType:"datatypes", name:"DataTypes"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"DataTypes", description:"Container for property datatype definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(relationshiptypes:Identity:RelationshipTypes {uuid:"", contentType:"relationship_types", name:"Relationship Types"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Relationship Types", description:"Container for content type relationship type definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(content:Identity:Content {uuid:"", contentType:"content", name:"Content"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Content", description:"Container for content objects (content type instances)"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(users:Identity:Users {uuid:"", contentType:"users", name:"Users"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Users", description:"Container for users"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(groups:Identity:Groups {uuid:"", contentType:"groups", name:"Groups"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Groups", description:"Container for user groups"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(roles:Identity:Roles {uuid:"", contentType:"roles", name:"Roles"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Roles", description:"Container for roles"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(workflows:Identity:Workflows {uuid:"", contentType:"workflows", name:"Workflows"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Workflows", description:"Container for workflows"})
CREATE root-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(overrides:Identity:Workflows {uuid:"", contentType:"overrides", name:"Overrides"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Overrides", description:"Container for template override rule definitions"})

// Create content types
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(contenttypecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Content Type"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Content Type", identifier:"content_type"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(propertytypecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Property Type"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Property Type", identifier:"property_type"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(datatypecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Data Type"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Data Type", identifier:"data_type"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(relationshiptypecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Relationship Type"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Relationsip Type", identifier:"relationship_type"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(usercontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"User"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"User", identifier:"user"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(overridecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Override"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Override", identifier:"override"})

// Create data types
CREATE datatypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(stringDataType:Identity:ContentType {uuid:"", contentType:"data_type", name:"String"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"String", identifier:"string"})
CREATE datatypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(integerDataType:Identity:ContentType {uuid:"", contentType:"data_type", name:"Integer"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Integer", identifier:"integer"})
CREATE datatypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(numberDataType:Identity:ContentType {uuid:"", contentType:"data_type", name:"Number"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Number", identifier:"number"})
CREATE datatypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(objectDataType:Identity:ContentType {uuid:"", contentType:"data_type", name:"Object"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Object", identifier:"object"})
CREATE datatypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(arrayDataType:Identity:ContentType {uuid:"", contentType:"data_type", name:"Array"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Array", identifier:"array"})
CREATE datatypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(booleanDataType:Identity:ContentType {uuid:"", contentType:"data_type", name:"Boolean"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Boolean", identifier:"boolean"})
CREATE datatypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(nullDataType:Identity:ContentType {uuid:"", contentType:"data_type", name:"Null"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Null", identifier:"null"})

// Create content type properties
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Identifier"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Identifier", identifier:"identifier", description:"", type:"string"})
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Title"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Title", identifier:"title", description:"", type:"string"})
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Description"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Description", identifier:"description", description:"", type:"string"})

// Create property type properties (JSON Schema)
// - General Properties
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Identifier"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Identifier", identifier:"identifier", description:"", type:"string"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Title"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Title", identifier:"title", description:"", type:"string"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Description"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Description", identifier:"description", description:"", type:"string"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Type"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Type", identifier:"type", description:"", type:"string"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Default"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Default", identifier:"default", description:"", type:"string"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Enumerated Values"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Enumerated Values", identifier:"enum", description:"", type:"array"})

// - String properties
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minLength:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Minimum Length"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Minimum Length", identifier:"minLength", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maxLength:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Maximum Length"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Maximum Length", identifier:"maxLength", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(pattern:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Pattern"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Pattern", identifier:"pattern", description:"", type:"string"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(Format:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Format"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Format", identifier:"Format", description:"", type:"string"})

// - Number properties
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(multipleOf:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Multiple Of"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Multiple Of", identifier:"multipleOf", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minimum:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Minimum"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Minimum", identifier:"minimum", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maximum:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Maximum"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Maximum", identifier:"maximum", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(exclusiveMinimum:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Exclusive Minimum"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Exclusive Minimum", identifier:"exclusiveMinimum", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(exclusiveMaximum:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Exclusive Maximum"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Exclusive Maximum", identifier:"exclusiveMaximum", description:"", type:"integer", minimum:0})

// - Object properties
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(properties:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Properties"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Properties", identifier:"properties", description:"", type:"object"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(required:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Required"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Required", identifier:"required", description:"", type:"array"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minProperties:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Minimum Properties"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Minimum Properties", identifier:"minProperties", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maxProperties:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Maximum Properties"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Maximum Properties", identifier:"maxProperties", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(dependencies:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Dependencies"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Dependencies", identifier:"dependencies", description:"", type:"object"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(patternProperties:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Pattern Properties"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Pattern Properties", identifier:"patternProperties", description:"", type:"object"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(additionalProperties:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Additional Properties"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Additional Properties", identifier:"additionalProperties", description:"", type:"object"})

// - Array properties
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(items:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Items", identifier:"items", description:"", type:"array"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minItems:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Minimum Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Minimum Items", identifier:"minItems", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maxItems:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Maximum Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Maximum Items", identifier:"maxItems", description:"", type:"integer", minimum:0})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(uniqueItems:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Unique Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Unique Items", identifier:"uniqueItems", description:"", type:"boolean"})
CREATE propertytypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(additionalItems:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Additional Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Additional Items", identifier:"additionalItems", description:"", type:"boolean"})

// - Boolean properties


// anyOf, allOf, oneOf, not

// Add relationships between datatypes and properties
// - String properties
//CREATE stringDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minLength)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE stringDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maxLength)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE stringDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(pattern)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE stringDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(Format)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)

// - Number properties
//CREATE integerDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(multipleOf)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE integerDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minimum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE integerDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maximum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE integerDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(exclusiveMinimum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE integerDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(exclusiveMaximum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE numberDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(multipleOf)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE numberDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minimum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE numberDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maximum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE numberDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(exclusiveMinimum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE numberDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(exclusiveMaximum)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)

// - Object properties
//CREATE objectDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(properties)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE objectDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(required)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE objectDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minProperties)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE objectDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maxProperties)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE objectDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(dependencies)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE objectDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(patternProperties)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE objectDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(additionalProperties)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)

// - Array properties
//CREATE arrayDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(items)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE arrayDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(minItems)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE arrayDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(maxItems)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE arrayDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(uniqueItems)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)
//CREATE arrayDataType-[:HAS_PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(additionalItems)<-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]-(propertytypes)

// Create relationship type properties
CREATE relationshiptypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Identifier"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Identifier", identifier:"identifier", description:"", type:"string"})
CREATE relationshiptypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Title"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Title", identifier:"title", description:"", type:"string"})
CREATE relationshiptypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Type"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Type", identifier:"type", description:"", type:"string", default:"relationship"})
CREATE relationshiptypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Direction"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Direction", identifier:"direction", description:"Relationship direction: outbound or inbound", type:"string", enum:["outbound", "inbound"]})
CREATE relationshiptypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Minimum Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Minimum Items", identifier:"minItems", description:"", type:"integer", minimum:0})
CREATE relationshiptypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Maximum Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Maximum Items", identifier:"maxItems", description:"", type:"integer", minimum:0})
CREATE relationshiptypecontenttype-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Unique Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Unique Items", identifier:"uniqueItems", description:"", type:"boolean"})

// Create Enum relationship type and its properties
CREATE relationshiptypes-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(enumRelationshipType:Identity:RelationshipType {uuid:"", contentType:"relationship_type", name:"Enumerated Items"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Enumerated Items", identifier:"enum", direction:"outbound", minItems:1, uniqueItems:true, type:"relationship"})
CREATE enumRelationshipType-[:PROPERTY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(:Identity:PropertyType {uuid:"", contentType:"property_type", name:"Depth"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {title:"Depth", identifier:"depth", type:"integer", minimum:1, default:1})
CREATE relationshiptypecontenttype-[:RELATIONSHIP {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(enumRelationshipType)-[:ENUM {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", depth:1000000}]->(root)


// Create admin user and administrators group
CREATE users-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(user:Identity:User {uuid:"", contentType:"user", name:"Admin User"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {firstName:"Admin", lastName:"User", username:"admin", email:""})
CREATE groups-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(group:Identity:Group {uuid:"", contentType:"group", name:"Administrators"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Administrators", description:""})
CREATE group-[:MEMBER {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->user
CREATE user-[:MEMBER_OF {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->group

// Create roles and assign them

// Create created relationships
WITH user
MATCH (identity:Identity), (version:Version)
MERGE user-[:CREATED {timestamp:timestamp()}]->identity
MERGE user-[:CREATED {timestamp:timestamp()}]->version

// Return the newly created nodes
RETURN user, identity, version

// LOGICAL MODEL
MATCH (n)-[r]->(m)
WHERE NOT (n)-[r:CREATED|VERSION]->(m)
RETURN n,r,m

//DELETE ALL NODES AND RELATIONSHIPS
MATCH (n)-[r]-() DELETE n,r

// Import Glossary Terms
LOAD CSV WITH HEADERS FROM "file:///C:/Users/fhore/OneDrive%20-%20Gavi/Gavi%20glossary.csv" AS csvLine
MATCH (contentRoot:Content:Identity {name: 'Content', contentType: 'content'})
CREATE (contentRoot)-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(glossaryIdentity:ContentObject:Folder:Identity {name:"Glossary", contentType:"folder"})
CREATE (glossaryIdentity)-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Glossary", description:"Gavi glossary of terms"})
CREATE (glossaryIdentity)-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(glossaryTermIdentity:ContentObject:GlossaryTerm:Identity {name:csvLine.Term, contentType:"glossary_term"})
CREATE (glossaryTermIdentity)-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(glossaryTermVersion:Version {term:csvLine.Term, acronym:csvLine.Acronym, synonym:csvLine.Synonym, description:csvLine.Description, link:csvLine.Link, category:csvLine.Category, french:csvLine.French, spanish:csvLine.Spanish, russian:csvLine.Russian})
RETURN glossaryTermIdentity, glossaryTermVersion

MATCH (glossary:Identity {name:"Glossary"})


// Create Geometry
MATCH (author)
WHERE id(author) = 126
WITH author
MATCH (process:Identity)
WHERE process.spId=55
WITH author, process
MATCH (element:Identity)
WHERE element.spId = 73
CREATE (process)-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(childidentity:Identity:ContentObject:Geometry {contentType:"geometry"})-[:VERSION {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(childversion:Version)
CREATE (element)-[:GEOMETRY {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(childidentity)
CREATE (author)-[:CREATED {timestamp:timestamp()}]->(childidentity)
CREATE (author)-[:CREATED {timestamp:timestamp()}]->(childversion)
RETURN author, process, element, childidentity, childversion

// Create parent-child relationships
MATCH (:Folder {name:"Processes"})-[r:CONTAINS]->(b)
WHERE NOT b:Flagged
WITH b,r LIMIT 50
MATCH (a:Identity {spID:toInt(b.spParentIDs)})
SET b:Flagged
CREATE (a)-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(b)
DELETE r
RETURN a,b

// Create parent-child relationships - Contains
MATCH (:Folder {name:"Processes"})-[r:CONTAINS]->(b)
WHERE NOT b:Flagged
WITH b,r LIMIT 100
MATCH (a:Identity) WHERE b.spParentIDs CONTAINS toString(a.spID)
SET b:Flagged
CREATE (a)-[:CONTAINS {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(b)
DELETE r
RETURN a,b

// Get Processes
MATCH (a:Folder {name:"Processes"})-[:CONTAINS*]->(b)
RETURN a,b

// Get Processes
MATCH (a:Folder {name:"Processes"})-[:CONTAINS*]->(b)-[:GEOMETRY]->(c)
RETURN a,b,c

// Get Overrides
MATCH (a:ContentType {name:"Override"})-->(b:PropertyType)-->(c:Version)
RETURN a,b,c

// Delete processes
MATCH (a:Folder {name:"Processes"})-[pr:CONTAINS*]->(b)-[vr:VERSION]->(c)
DETACH DELETE b,c

// Load Processes CSV
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'http://146.185.147.45/datasets/PMT%20snapshot%202016-04-18-2300.csv' as line

// Create Responsible For relationships
MATCH (a:Activity)-[:VERSION {to:9007199254740991}]->(b:Version)
WHERE NOT a:Flag
WITH a,b LIMIT 200
MATCH (c:Actor {spID:toInt(b.Responsible)})
SET a:Flag
CREATE (c)-[:RESPONSIBLE_FOR {from:timestamp(), to:9007199254740991, versionNumber:1, versionName:"Initial"}]->(a)
RETURN a,c

// Get Process Map
MATCH (a:Activity {name:"Receive Grant Support"})-[:CONTAINS]->(b)-[:VERSION]->(c)
MATCH (a)-[:CONTAINS]->(d:MxCell)<-[:HAS_MXCELL]-(b)
MATCH (d)-[:VERSION]->(e)
WHERE NOT b:MxCell
RETURN 
{
	id: id(a),
	name: a.name,
	contentType: a.contentType,
	children: collect({
		id: id(b),
		name: b.name,
		contentType: b.contentType,
		properties: c,
		mxCell: {
    		id: id(d),
    		name: d.name,
    		properties: e
    	}
	})
} AS result