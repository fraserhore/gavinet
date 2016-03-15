

// CREATE (CONTENT) - Add a ContentObject IdentityNode and Version node
// Match the parent node
MATCH (parent)
WHERE id(parent)=19
// Create the new child content object's identity and version nodes and their relationships
CREATE parent-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(childidentity:IdentityNode:ContentObject)-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(childversion:Version)
// Set the content object's type as a label on the identity node
SET childidentity:Folder
// Set the content object's properties
SET childversion = {name:"Folder Name", description:"This is a description"}
// Set the identity node name
SET childidentity.name = childversion.name
// Return the newly created nodes
RETURN parent,childidentity,childversion

// UPDATE (CONTENT) - Add a Version node
MATCH (identitynode)-[currentversionrelationship:VERSION {to:9223372036854775807}]->(currentversion)
WHERE id(identitynode)=3 AND currentversionrelationship.lang = "en-gb"
// Update the current version relationship to end validity
SET currentversionrelationship.to = timestamp()
// Create the new version relationship and node
CREATE identitynode-[newversionrelationship:VERSION {from:timestamp(), to:9223372036854775807}]->(newversion:Version)
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
CREATE newparent-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(child)
// Return the newly created nodes
RETURN currentparent, newparent, child

// UPDATE (LOCATION - ADD) - Add a location / parent node
// Match the parent and child  nodes
MATCH (parent),(child)
WHERE id(parent)=19 AND id(child)=31
// Create the new parent->child relationship
CREATE parent-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(child)
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
MATCH (a)-[:VERSION {to:9223372036854775807, lang:"en-gb"}]->(b)
WHERE id(a) = 1
RETURN a as IdentityNode, b as VersionNode

// READ - Get by ID, current version
MATCH (a)-[version:VERSION]->(b)
WHERE id(a) = 1 AND version.to = 9223372036854775807 AND version.lang = "en-gb"
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
MATCH (a)-[r:CONTAINS {to:9223372036854775807}]->(b)-[:VERSION {to:9223372036854775807}]->(c)
WHERE id(a) = 1
RETURN b as IdentityNode, c as VersionNode

// READ - Get Subtree
MATCH (a)-[r:CONTAINS* {to:9223372036854775807}]->(b), b-[:VERSION {to:9223372036854775807}]-(c)
WHERE id(a) = 1
RETURN a,b,c

// READ - Get Subtree 2
MATCH (a)-[r:CONTAINS* {to:9223372036854775807}]->(b)
WHERE id(a) = 1
RETURN a,r,b

// READ - Get Subtree 3
MATCH path = (a)-[r:CONTAINS* {to:9223372036854775807}]->(b)
WHERE id(a) = 1 AND not(b-[:CONTAINS{to:9223372036854775807}]->())
RETURN path

// READ - Get Subtree 4
MATCH (a)-[r:CONTAINS* {to:9223372036854775807}]->(b)
WHERE id(a) = 1
WITH b
MATCH (a)-[r:CONTAINS {to:9223372036854775807}]->b-[:VERSION {to:9223372036854775807}]-(c)
RETURN a,b,c

// READ - Get Subtree 5
// This is also an example of using the rest API.
:POST /db/data/transaction/commit
{
  "statements" : [ {
    "statement" : "MATCH (a)-[r:CONTAINS|VERSION* {to:9223372036854775807}]->(b) WHERE id(a) = 1 RETURN COLLECT(b), COLLECT(r)",
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
CREATE (root:Identity:Root {name:"Root"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(version:Version {name:"Root", description:"This is the root node for the application"})

// Create sub-nodes
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(contenttypes:Identity:ContentTypes {uuid:"", contentType:"content_types", name:"ContentTypes"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"ContentTypes", description:"Container for content type definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(properties:Identity:Properties {uuid:"", contentType:"properties", name:"Properties"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Properties", description:"Container for content type property definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(datatypes:Identity:DataTypes {uuid:"", contentType:"datatypes", name:"DataTypes"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"DataTypes", description:"Container for property datatype definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(relationships:Identity:Relationships {uuid:"", contentType:"relationships", name:"Relationships"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Relationships", description:"Container for content type relationship definitions"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(content:Identity:Content {uuid:"", contentType:"content", name:"Content"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Content", description:"Container for content objects (content type instances)"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(users:Identity:Users {uuid:"", contentType:"users", name:"Users"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Users", description:"Container for users"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(groups:Identity:Groups {uuid:"", contentType:"groups", name:"Groups"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Groups", description:"Container for user groups"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(roles:Identity:Roles {uuid:"", contentType:"roles", name:"Roles"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Roles", description:"Container for roles"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(workflows:Identity:Workflows {uuid:"", contentType:"workflows", name:"Workflows"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Workflows", description:"Container for workflows"})
CREATE root-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(overrides:Identity:Workflows {uuid:"", contentType:"overrides", name:"Overrides"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Overrides", description:"Container for template override rule definitions"})

// Create content types
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(contenttypecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Content Type"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Content Type", identifier:"content_type"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(propertycontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Property"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Property", identifier:"property"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(datatypecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Data Type"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Data Type", identifier:"data_type"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(relationshipcontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Relationship"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Relationsip", identifier:"relationship"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(usercontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"User"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"User", identifier:"user"})
CREATE contenttypes-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(overridecontenttype:Identity:ContentType {uuid:"", contentType:"content_type", name:"Override"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Override", identifier:"override"})

// Create properties and datatypes
// Content type
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Name"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Name", identifier:"name", description:"", type:"string"})
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Identifier"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Identifier", identifier:"identifier", description:"", type:"string"})
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Title"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Title", identifier:"title", description:"", type:"string"})
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Description"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Description", identifier:"description", description:"", type:"string"})
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Type"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Type", identifier:"type", description:"", type:"string"})
CREATE contenttypecontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Required"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Required", identifier:"required", description:"", type:"array"})

// Property (JSON Schema)
CREATE propertycontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Name"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Name", identifier:"name", description:"", type:"string"})
CREATE propertycontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Identifier"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Identifier", identifier:"identifier", description:"", type:"string"})
CREATE propertycontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Description"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Description", identifier:"description", description:"", type:"string"})
CREATE propertycontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Type"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Type", identifier:"type", description:"", type:"string"})
CREATE propertycontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Minimum"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Minimum", identifier:"minimum", description:"", type:"integer"})
CREATE propertycontenttype-[:PROPERTY {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(:Identity:Property {uuid:"", contentType:"property", name:"Maximum"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Maximum", identifier:"maximum", description:"", type:"integer"})

// Create admin user and administrators group
CREATE users-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(user:Identity:User {uuid:"", contentType:"user", name:"Admin User"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {firstName:"Admin", lastName:"User", username:"admin", email:""})
CREATE groups-[:CONTAINS {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->(group:Identity:Group {uuid:"", contentType:"group", name:"Administrators"})-[:VERSION {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial", lang:"en-gb"}]->(:Version {name:"Administrators", description:""})
CREATE group-[:MEMBER {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->user
CREATE user-[:MEMBER_OF {from:timestamp(), to:9223372036854775807, versionNumber:1, versionName:"Initial"}]->group

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
