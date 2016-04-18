{ezpagedata_set( 'left_menu', false() )}

{def $mxGraph_Model = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'sort_by', array('priority',true()),'class_filter_type', 'include', 'class_filter_array', array('xml_model') ) ).0
     $mxGraph_Model_object = $mxGraph_Model.object
     $current_user = fetch( 'user', 'current_user' )
     $current_user_object = $current_user.contentobject
}

{*<!-- Create an array or rows in a table where each row represents a point in the path where an object is under more than one perspective -->*}
{def $root_nodes = false()
     $current_path = $node.path|append($node)
     $path_from_root = false()
     $path_array_from_root = false()
     $node_in_path = false()
     $object_intersections_array = array()
     $object_intersections_row_array = array()
     $row_item_count = 0
     $row_item_path = false()
     $path_root_index = 0
}

{foreach $current_path as $index => $item}
    {if $item.class_identifier|eq('activity')}
        {set $root_nodes = fetch( 'content', 'list', hash( 'parent_node_id', $item.parent_node_id, 'sort_by', array( array( priority, true() ), array( published, true() ) ),'class_filter_type', 'include', 'class_filter_array', array('activity') ) )
             $path_from_root = $current_path|extract($index)
             $path_array_from_root = $node.path_array|extract($index)
        }
        {break}
    {/if}
{/foreach}

{foreach $path_from_root as $index => $item}
    {set $object_intersections_row_array = array()}
    {foreach $root_nodes as $root_node}
        {set $node_in_path = false()}
        {foreach $item.object.assigned_nodes as $assigned_node}
            {if $assigned_node.path_array|contains($root_node.node_id)}
                {set $node_in_path = $assigned_node}
                {break}
            {/if}
        {/foreach}
        {set $object_intersections_row_array = $object_intersections_row_array|append($node_in_path)}
    {/foreach}
    {set $row_item_count = 0}
    {foreach $object_intersections_row_array as $row_item}
        {if $row_item}
            {set $row_item_count = $row_item_count|sum(1)}
        {/if}
    {/foreach}
    {if $row_item_count|gt(1)}
        {set $object_intersections_array = $object_intersections_array|append($object_intersections_row_array)}
    {/if}
{/foreach}

{*<!-- Left panel with each mxGraph diagram in the current activity's path. In each diagram, the white box represents the activity that is in the path. -->*}
<div id="col-left" class="class-activity" style="width:20px; max-width:50%;" >
    
    <div class="col-collapse-left-activity">»</div>
    
    <nav id="subnavigation">       
        <h4 id="subnavigation-heading" class="snav"{if $root_node.object.current_language|eq('ara-SA')} dir="rtl"{/if}><a class="button-home" href="{$left_menu_root_url|ezurl('no')}">Menu</a></h4>
        <!-- Breadcrumb navigation -->
        {def $path = $node.path
             $root_node_id = 6293
             $perspectives = fetch( 'content', 'list', hash( 'parent_node_id', $root_node_id, 'sort_by', array('priority',true()),'class_filter_type', 'include', 'class_filter_array', array('folder', 'activity') ) )
             $below_root = false()
             $show_icon = false()
        }
        <ul id="nav2" class="" style="padding:0;">
            <li class="dropdown"><a class="dropdown-toggle" href="#" title="Perspectives">Change Perspective<i class="icon-caret-down"></i></a>
                <ul class="dropdown-menu">
                    {foreach $root_nodes as $perspective}
                        <li>
                            <a href="{$perspective.url_alias|ezurl('no')}">{$perspective.name|wash}</a>
                        </li>
                    {/foreach}
                </ul>
            </li>
            
            <li>
                <h3>Path</h3>
                <div>The following activity graphs display the path to the current activity. Each graph illustrates the sub-activities of the activity highlighted in white in the graph above it.</div>
            </li>
            
            {foreach $path_from_root as index => $item}
                    <li>
                        <div id="graph-{$item.node_id}" style="background-color: #f5f5f5; margin-bottom: 10px; ">
                            <h2>
                                {if $show_icon}<img src="{'issat/icon-subprocess.svg'|ezimage('no')}" data-fallback="{'issat/icon-subprocess.png'|ezimage('no')}" alt="icon" width="40px"/>{/if}
                                <a href="{$item.url_alias|ezurl('no')}" style="position:relative; bottom:-15px;">{$item.name}</a>
                            </h2>
                        </div>
                    </li>
                    {set $show_icon = true()}
            {/foreach}
            
        </ul>
        
    </nav>
    
    <div id="left-menu-resizeable-handle" class="ui-resizable-handle ui-resizable-e"></div>
    
</div>

<div id="col-mid-large">
    <div class="content-view-full class-activity">
        
        {*<!-- Links to the presentation, if there is one, and to the download options (A4 or Letter) -->*}
        <div id="activity-action-links" class="no-print">
            {if $node.data_map.presentation_url.has_content}
                <a href="#activity-presentation" style="display:inline-block; text-align: center; color:#1f768a; text-decoration:none;">
                    <svg viewBox="0 0 24 24" height="70" width="70" preserveAspectRatio="xMidYMid meet" fit="" style="pointer-events: none; display: block; margin:auto;"><g><path fill="#1f768a" d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10c5.5,0,10-4.5,10-10S17.5,2,12,2z M10,16.5v-9l6,4.5L10,16.5z"></path></g></svg>
                    Presentation
                </a>
            {/if}
            <a href="#download-links" style="display:inline-block; text-align: center; color:#1f768a; text-decoration:none;">
                <svg viewBox="0 0 24 24" height="70" width="70" preserveAspectRatio="xMidYMid meet" fit="" style="pointer-events: none; display: block; margin:auto;"><g><path fill="#1f768a" d="M19,9h-4V3H9v6H5l7,7L19,9z M5,18v2h14v-2H5z"></path></g></svg>
                Download
            </a>
        </div>
        
        {*<!-- Activity name -->*}
        <h1>{$node.name|wash()}</h1>
        
        {*<!-- Graph of sub-activities -->*}
        <div id="sub-activities-graph">
            {if and( eq($view_parameters.edit_graph, '1'), $node.can_edit )}
            
            {*<!-- Edit interface for the graph -->*}
            <div id="page">
                <span id="mainActions" style="margin:8px 8px 8px 0;"></span><a href="{$node.url_alias|ezurl('no')}">Finish Editing</a><span>  Internal Link: /content/view/full/{$node.node_id}</span>
                <div id="toolbar" style="margin:8px 0 8px 0;"><!-- Toolbar Here --></div>
                <div id="graph" style="min-height:300px;">
                    <!-- Graph Here -->
                    <center id="splash" style="padding-top:230px;">
                        <img src="/extension/fh_mxgraph/design/standard/javascript/mxgraph/images/loading.gif">
                    </center>
                </div>
                <div id="footer">
                    <div id="properties"></div>
                    <span id="selectActions" style="margin:8px;"></span><span id="zoomActions" style="margin:8px;"></span>
                    <p id="status">
                        <!-- Status Here -->Loading...
                    </p>
                    <br/>
                </div>
            </div>
            
            <div id="mxgraph-model"></div>
            <div id="graph-versions">Previous versions:
                {foreach $mxGraph_Model_object.versions as $version}
                <span id="graph-version-{$version.version}">
                    <a href="#">{$version.version}</a>&nbsp;
                </span>
                {/foreach}
            </div>
            
            {else}
            
            {*<!-- View interface for the graph -->*}
            <h2>Activity Overview</h2>
            <div id="activity-navigation-links" class="no-print">
                <div id="show-activity-path">
                    <svg xmlns:svg="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="70" height="70" preserveAspectRatio="xMidYMid meet" fit="" style="margin:auto;" >
                        <g>
                            <g stroke="null" id="svg_9" opacity="0.75">
                                <path stroke="#ffffff" id="svg_10" fill="#4CBCED" d="m19.869999,13.812628c-0.210001,-0.349998 -0.629999,-0.559996 -1.120001,-0.559996l-7.699997,0c-0.769998,0 -1.399999,0.629997 -1.399999,1.399998l0,6.999996c0,0.77 0.630001,1.4 1.399999,1.4l7.699997,0c0.490002,0 0.91,-0.209999 1.120001,-0.559999l3.079996,-4.339998l-3.079996,-4.339998l0,-0.000002z"/>
                            </g>
                            <g stroke="null" opacity="0.75" id="svg_3">
                                <path stroke="#ffffff" id="svg_4" fill="#4CBCED" d="m18.332636,7.997887c-0.263687,-0.43947 -0.791054,-0.70315 -1.406319,-0.70315l-9.668419,0c-0.966841,0 -1.757895,0.791046 -1.757895,1.757887l0,8.789473c0,0.966843 0.791053,1.757895 1.757895,1.757895l9.668419,0c0.615265,0 1.142632,-0.263683 1.406319,-0.703157l3.867363,-5.449471l-3.867363,-5.449474l0,-0.000002z"/>
                            </g>
                            <g opacity="0.75" id="svg_1">
                                <path stroke="#ffffff" id="svg_2" fill="#4CBCED" d="m16.449993,2.100003c-0.300001,-0.5 -0.9,-0.8 -1.6,-0.8l-10.999993,0c-1.1,0 -2,0.900001 -2,2.000001l0,9.999982c0,1.1 0.9,2 2,2l10.999993,0c0.700001,0 1.299999,-0.299999 1.6,-0.799999l4.4,-6.200001l-4.4,-6.199982l0,0z"/>
                            </g>
                        </g>
                    </svg>
                    <div class="activity-navigation-link-text">Show Activity Path</div>
                </div>
                <div id="parent-graph-links">
                    {foreach $node.object.assigned_nodes as $assigned_node}
                    <a href="{$assigned_node.parent.url_alias|ezurl('no')}" class="parent-graph-link" title="Up one level">
                            {$assigned_node.parent.name|wash()}
                        </a>
                    {/foreach}
                    <div class="activity-navigation-link-text">Go Up One Level</div>
                </div>
                {*<img id="where-am-i-button" role="button" src="{'/issat/where-am-i.svg'|ezimage('no')}" style="width:90px; position:relative; top:-10px; left:10px;"/>*}
            </div>
            
            {*<!-- Display the path to the current item for each perspective -->*}
            {*
            <div id="where-am-i-map" style="display:none">

                
                <table>
                    <tr>
                        {foreach $root_nodes as $root_node}
                            <th>{$root_node.name|wash()}</th>
                        {/foreach}
                    </tr>
                    
                    <!-- Iterate through each row representing an object that is in more than one perspective and display the path for each perspective -->
                    {foreach $object_intersections_array as $intersection_row}
                        <tr>
                            {foreach $intersection_row as $root_nodes_index => $row_item}
                                <td style="vertical-align:bottom; width:33%;">
                                    {if $row_item}
                                        {set $row_item_path = $row_item.path|append($row_item)
                                             $below_root = false()
                                             $path_root_index = false()
                                        }
                                        {foreach $row_item_path as $row_item_path_index => $item}
                                            {if $item.node_id|eq($root_nodes[$root_nodes_index].node_id)}
                                                {set $below_root = true()
                                                     $path_root_index = $row_item_path_index|sum(1)
                                                }
                                                {continue}
                                            {/if}
                                            {if $below_root}
                                                <div id="graph2-{$item.node_id}" style="margin-left:{10|mul($row_item_path_index|sub($path_root_index))}px;">
                                                    <span>
                                                        &#8627;
                                                        <a href="{$item.url_alias|ezurl('no')}" style="text-decoration:none;">{$item.name|wash()}</a>
                                                    </span>
                                                </div>
                                            {/if}
                                        {/foreach}
                                    {/if}
                                </td>
                            {/foreach}
                        </tr>
                    {/foreach}
                    <!-- In the last row, display the remaining items from the current node's path -->
                    {def $last_intersections_row = $object_intersections_array|extract_right(1).0
                         $last_intersection_node = false()
                         $last_intersection_node_index = 0
                         $path_from_last_intersection_node = false()
                         $show_item = true()
                    }
                    <tr>
                        {foreach $root_nodes as $root_nodes_index => $root_node}
                            <!-- Make sure the root node is in the current node's path -->
                            {if $node.path_array|contains($root_node.node_id)}
                                {set $last_intersection_node = $last_intersections_row[$root_nodes_index]}
                                {if $last_intersection_node}
                                    {set $show_item = false()}
                                {/if}
                                <td>
                                    {foreach $path_from_root as $index => $item offset 1}
                                        {if and( not($show_item), $item.node_id|eq($last_intersection_node.node_id) )}
                                            {set $show_item = true()
                                                 $last_intersection_node_index = $index
                                            }
                                            {continue}
                                        {/if}
                                        {if $show_item}
                                            <div id="graph2-{$item.node_id}" style="margin-left:{10|mul($index)}px;">
                                                <span>
                                                    &#8627;
                                                    <a href="{$item.url_alias|ezurl('no')}" style="text-decoration:none;">{$item.name|wash()}</a>
                                                </span>
                                            </div>
                                        {/if}
                                    {/foreach}
                                </td>
                            {else}
                                <td></td>
                            {/if}
                        {/foreach}
                    </tr>
                    
                </table>
  
            </div>
            *}
            
            {*<!-- Graph -->*}
            {if $mxGraph_Model}
            <div id="mxGraph-view"></div>
            
            <div class="clearfix" style="margin-bottom:40px; margin-top:25px; width:100%;">
                <details id="mxGraph-legend" style=" width:100%; float:right; text-align:right;">
                    <summary style="text-align:right;">Legend</summary>
                    <img src="{'/issat/methodology_legend.svg'|ezimage('no')}" style="width:450px;"/>
                </details>
                <div style=" width:100%; text-align:right; font-size:80%">Powered by <a href="http://www.jgraph.com/mxgraph.html">mxGraph</a></div>
            </div>
            {/if}
            {if $node.can_edit}
            <a style=" width:100%; text-align:right; display:block;" class="button button-minimal no-print" href="{$node.url_alias|ezurl('no')}/(edit_graph)/1">Add and Edit Sub-Activities</a>
            {/if}
            
            {/if}
        </div>
      
        {*<!-- Resources panel -->*}
        <div id="resources" class="nav3">
            <h3>Resources</h3>
            
            {def $inputs = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'sort_by', array('priority',true()),'class_filter_type', 'include', 'class_filter_array', array('input') ) )}
            {if $inputs}
            <div id="inputs">
                <div>
                    <img src="{'issat/input.png'|ezimage('no')}" width="30" height="30" alt=""/>
                    <h4 style="display:inline-block;">Inputs</h4>
                </div>
                <ul class="related-resource-list">
                    {foreach $inputs as $item}
                    <li class="float-break">
                        <a href="{$item.url_alias|ezurl('no')}">
                            <span>{$item.name}</span>
                        </a>
                    </li>
                    {/foreach}
                </ul>
            </div>
            {/if}
            
            {def $outputs = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'sort_by', array('priority',true()),'class_filter_type', 'include', 'class_filter_array', array('output') ) )}
            {if $outputs}
            <div id="outputs">
                <div>
                    <img src="{'issat/output.png'|ezimage('no')}" width="30" height="30" alt=""/>
                    <h4 style="display:inline-block;">Outputs</h4>
                </div>
                <ul class="related-resource-list">
                    {foreach $outputs as $item}
                    <li class="float-break">
                        <a href="{$item.url_alias|ezurl('no')}">
                            <span>{$item.name}</span>
                        </a>
                    </li>
                    {/foreach}
                </ul>
            </div>
            {/if}
            
            <div id="other-resources">
                {def $resource_array = hash( 
                    'ogn', 'Operational Guidance Notes',
                    'case_study', 'Case Studies',
                    'tool', 'Tools',
                    'video', 'Videos',
                    'podcast', 'Podcasts',
                    'paper', 'Policy and Research Papers',
                    'book', 'Books',
                    'other_document', 'Other Documents',
                    'training_course', 'Training Course',
                    'elearning_course', 'eLearning Course'
                )}
                {foreach $resource_array as $identifier => $heading}
                    {def $related_resources = fetch('content', 'reverse_related_objects', hash('object_id', $node.contentobject_id, 'attribute_identifier', concat( $identifier, '/activity' ), 'sort_by', array('name', true())))
                         $parent_node = fetch('content', 'node', hash('node_id', $related_resources.0.main_parent_node_id))
                    }
                    {if $related_resources}
                        <div>
                            <img src="{concat('issat/', $identifier, '.png')|ezimage('no')}" width="30" height="30" alt=""/>
                            <h4 style="display:inline-block;">
                                <a style="color:black;" href="{$parent_node.url_alias|ezurl('no')}"> {$parent_node.name|wash()}</a>
                            </h4>
                        </div>
                        <ul class="related-resource-list">
                            {foreach $related_resources as $related_resource max 5}              
                            <li class="float-break">
                                <a href="{$related_resource.main_node.url_alias|ezurl('no')}">
                                    <span>{$related_resource.name}</span>
                                </a>
                            </li>
                            {/foreach}
                        </ul>
                    {/if}
                    {undef $related_resources}
                {/foreach}
            </div>
            {def $programmes = fetch( 'content', 'reverse_related_objects', hash( 'object_id', $node.contentobject_id,'attribute_identifier', 'programme/activity', 'sort_by', $node.sort_array ) )}
            {if $programmes}
            <div id="programmes">
                <h3>Programmes</h3>
                {foreach $programmes as $programme}
                {node_view_gui view='line' content_node=$programme.main_node}
                {/foreach}
            </div>
            {/if}
            {def $mandates = fetch( 'content', 'reverse_related_objects', hash( 'object_id', $node.contentobject_id, 'attribute_identifier', 'mission/activity', 'sort_by', array('name', true()) ) )}
            {if $mandates}
            <div id="mandates">
                <h3>Mandates</h3>
                {foreach $mandates as $mandate}
                {node_view_gui view='line' content_node=$mandate.main_node}
                {/foreach}
            </div>
            {/if}
            <div id="experts">
                <h3>Experts</h3>
                {def $activity_skill_levels = fetch( 'content', 'list',hash( 'parent_node_id', 3005 ) )}
                {def $user_activity_skill_entry = fetch( 'content', 'list', hash( 
                    'parent_node_id', $current_user.contentobject.main_node_id,
                    'class_filter_type', 'include', 'class_filter_array', array('activity_skill'),
                    'attribute_filter', array( array( 'activity_skill/activity', '=', $node.contentobject_id ) )
                ) )}
                {if not($user_activity_skill_entry)}
                    {def $can_create = fetch( 'content', 'access', hash( 'access', 'create', 'contentobject', $current_user.contentobject, 'contentclass_id', 'activity_skill' ) )}
                    <div id="activity-skills">
                        {if $can_create}
                        <form method="post" action="/layout/set/ajax/directcontent/create">
                            <input type="hidden" name="ClassIdentifier" value="activity_skill" />
                            <input type="hidden" name="ParentNodeID" value="{$current_user.contentobject.main_node_id}" />
                            <!--<input type="hidden" name="RedirectURIAfterPublish" value="{$node.url_alias|ezurl('no')}" />-->
                            <input type="hidden" name="activity" value="{$node.contentobject_id}" />
                            <details>
                                <summary>Add this activity to your expertise</summary>
                                
                                {foreach $activity_skill_levels as $level}
                                <div>
                                    <input id="skill-level-{$level.contentobject_id}" type="radio" name="skill_level" value="{$level.contentobject_id}" style="position:relative; top:0; left:0; width:100%; height:100%; overflow:hidden; margin:0; padding:0; border:0; outline:0; opacity:0; filter: alpha(opacity=0); -moz-opacity:0; -khtml-opacity: 0;"/>
                                    <label style="color:white; width: auto;" for="skill-level-{$level.contentobject_id}" class="skill_level button toolTip" title="{$level.data_map.description.content.output.output_text|strip_tags()}">
                                        {$level.name|wash()}
                                    </label>
                                </div>
                                {/foreach}
                            </details>
                        </form>
                        {/if}
                    </div>
                {/if}
                
                {def $activity_skill_entries = false()
                     $no_activity_skill_entries = true()
                }
                {foreach $activity_skill_levels as $level reverse}
                    {set $activity_skill_entries = fetch( 'content', 'tree', hash( 
                         'parent_node_id', 12,
                         'class_filter_type', 'include', 'class_filter_array', array('activity_skill'),
                         'attribute_filter', array( 'and', 
                         array( 'activity_skill/activity', '=', $node.contentobject_id ), 
                         array( 'activity_skill/skill_level', '=', $level.contentobject_id ) )
                    ) )}
                    {if $activity_skill_entries}
                        <strong class="toolTip" title="{$level.data_map.description.content.output.output_text|strip_tags()}">{$level.name}</strong>
                        {set $no_activity_skill_entries = false()}
                        {foreach $activity_skill_entries as $activity_skill_entry}
                            {node_view_gui view=expert_line_short content_node=$activity_skill_entry include_edit_controls=true buttons_array=array('edit', 'remove') redirect_uri=$node.url_alias|ezurl('no')}
                        {/foreach}
                        {undef $activity_skill_entries}
                    {/if}
                {/foreach}
            </div>
            <div id="download-links">
                <h3>Download Current Page</h3>
                {if or($node.data_map.file_a4.has_content, $node.data_map.file_letter.has_content)}
                    {if $node.data_map.file_a4.has_content}
                        {def $file_attribute = $node.data_map.file_a4}
                        <a class="button download-link" href={concat("content/download/",$file_attribute.contentobject_id,"/",$file_attribute.id,"/file/",$file_attribute.content.original_filename)|ezurl} target="_blank">A4</a>
                        {undef $file_attribute}
                    {/if}
                    {if $node.data_map.file_letter.has_content}
                        {def $file_attribute = $node.data_map.file_letter}
                        <a class="button download-link" href={concat("content/download/",$file_attribute.contentobject_id,"/",$file_attribute.id,"/file/",$file_attribute.content.original_filename)|ezurl} target="_blank">Letter</a>
                        {undef $file_attribute}
                    {/if}
                {else}
                    <a class="button download-link" href="/phantomjs/create_pdf/{$node.node_id}/A4">A4</a>
                    <a class="button download-link" href="/phantomjs/create_pdf/{$node.node_id}/Letter">Letter</a>
                {/if}
            </div>
        </div>
        
        {*<!-- Description -->*}
        <div class="attribute-description-full">
            {attribute_view_gui attribute=$node.data_map.description}
        </div>
        
        {*<!-- Presentation -->*}
        {if $node.data_map.presentation_url.has_content}
        <div id="activity-presentation" class="no-print">
            <h3>Short Guide to {$node.name|wash()}</h3>
            <div class="external-presentation" style="width: 850; height: 618px;">
                <iframe width="850" height="618" src="{$node.data_map.presentation_url.content}" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
        {/if}
        
        {*<!-- Sub-activities List -->*}
        {def $sub_activities = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'sort_by', array( array( priority, true() ), array( published, true() ) ),'class_filter_type', 'include', 'class_filter_array', array('activity') ) )}
        {if $sub_activities}
        <h2>Sub-Activities</h2>
        <div id="sub-activities" class="content-view-children">
            {foreach $sub_activities as $sub_activity}
                {node_view_gui view='line' content_node=$sub_activity}
            {/foreach}
        </div>
        {/if}
        
        <!-- Content Action Buttons -->
        <div class="content-action-buttons">
            {include uri='design:parts/content_action_buttons.tpl' 
                node                    = $node 
                buttons_array           = array( 'edit', 'translate', 'remove', 'move', 'add_locations', 'subscribe', 'create' )
                button_style            = 'button-minimal'
                can_create_identifier_list   = hash('input', 'Input', 'output', 'Output')
            }
        </div>
        
        {*<!-- Discussion -->*}
        <div id="discussion">
            <h2>Discussion</h2>
            <form method="post" action={"directcontent/create"|ezurl}>
                {if $node.can_create}
                <input type="hidden" name="ClassIdentifier" value="comment" />
                <input type="hidden" name="ParentNodeID" value="{$node.node_id}" />
                <input type="hidden" name="subject" value="Re: {$node.name|wash}" />
                <input type="hidden" name="author" value="{$current_user_object.data_map.first_name.content} {$current_user_object.data_map.last_name.content}" />
                <textarea cols="80" rows="2" style="width: 450px; min-height: 22px;" name="message" placeholder="Comment..."></textarea>
                <input class="button" type="submit" name="NewButton" value="{'Submit'|i18n( 'design/ezwebin/full/article' )}" />
                <input type="hidden" name="RedirectURIAfterPublish" value="{$node.url_alias|ezurl('no', 'full')}" />
                <input type="hidden" name="RedirectIfDiscarded" value="{$node.url_alias|ezurl('no', 'full')}" />
                <input type="hidden" name="RedirectIfCancel" value="{$node.url_alias|ezurl('no', 'full')}" />
                {/if}
            </form>
            {def $comments = fetch( 'content', 'list', hash( 'parent_node_id', $node.node_id, 'sort_by', array('published',false()),'class_filter_type', 'include', 'class_filter_array', array('comment') ) )}
            {if $comments}
            {foreach $comments as $comment}
            {node_view_gui view='line' content_node=$comment}
            {/foreach}
            {else}
            <div>Be the first to add a comment!</div>
            {/if}
        </div>
        
    </div>
</div>
{*<!-- Javascript dependencies included already: jquery, jquery.ui, jquery.cookie, jquery.expander.js, fh_select_minimal_submit.js -->*}
{ezscript_require( array( '/javascript/libs/autosize/jquery.autosize-min.js' ) )}
<script type="text/javascript" charset="utf-8">
    <!--{literal}
    $(function() {
    
        // Function for posting a form
        var postForm = function( options ) {
            var form = options.formObject,
                url = $(form).attr('action'),
                data = $(form).serialize();
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                dataType: "json",
                success: function(response,status) {
                    if(options.redirectURI) {
                        window.location.href = options.redirectURI;
                    }
                },
                error:function(jqXHR, textStatus, errorThrown){
                    console.log('error');
                    console.log(errorThrown);
                }
            }); 
        };
                    
        // Add to expertise
        $('input[name="skill_level"]').change( function(){
            var options = {
                formObject: $(this).closest('form'),
                redirectURI: '{/literal}{$node.url_alias|ezurl("no")}{literal}'
            };
            postForm( options );
        });
        
        // Autosize textarea
        $('textarea').autosize();
       
            
    });
    {/literal}-->
</script>

<!-- Sets the basepath for the library if not in same directory -->
<script type="text/javascript">
    mxBasePath = '/extension/fh_mxgraph/design/standard/javascript/mxgraph';
</script>

<!-- Loads and initializes the library -->
<script type="text/javascript" src="/extension/fh_mxgraph/design/standard/javascript/mxgraph/js/mxClient.js"></script>

{if and( eq($view_parameters.edit_graph, '1'), $node.can_edit )}
<!-- Load the Edit view scripts -->
<script type="text/javascript" src="/extension/fh_mxgraph/design/standard/javascript/mxgraph/js/mxApplication.js"></script>
<script type="text/javascript" src="/extension/fh_mxgraph/design/standard/javascript/mxGraphActivityEditor.js"></script>
<script type="text/javascript">
    <!--{literal}

    // In the config file, the mxEditor.onInit method is overridden to invoke this global function as the last step in the editor constructor.
    function onInit(editor) {
        var nodeID = {/literal}{$node.node_id}{literal};
        
        // Open and initialize the Activity graph editor
        mxGraphActivityEditor(editor, nodeID);
    }

    // window.onbeforeunload = function() { return mxResources.get('changesLost'); };
    
    // The application starts here. The document.onLoad executes the mxApplication constructor with a given configuration.
    // The xml stylesheet that defines the look of the shapes is a seperate xml file that is included by the configuration file.
    $(function() {
        new mxApplication('/extension/fh_mxgraph/design/standard/javascript/mxgraph/config/diagrameditor.xml');
    });
    {/literal}-->
</script>
{else}
<!-- Load the View view scripts -->
<script type="text/javascript" src="/extension/fh_mxgraph/design/standard/javascript/mxGraphActivityViewer.js"></script>
<script type="text/javascript">
    <!--{literal}
    $(function() {
        // configURL points to the same xml configuration stylesheet that is included by the diagrameditor configuration file
        var configURL = '/extension/fh_mxgraph/design/standard/javascript/mxgraph/config/stylesheet.xml',
            siteAccess = {/literal}{'/'|ezurl()}{literal},
            rootNodeID = 6293,
            belowRoot = false,
            currentNodeID = {/literal}{$node.node_id}{literal},
            pathArray = [{/literal}{$path_array_from_root|implode(', ')}{literal}],
            pathArrayCount = pathArray.length,
            i = 0;
            console.log(siteAccess);
        mxGraphActivityViewer( document.getElementById('mxGraph-view'), currentNodeID, '', configURL, siteAccess );
        
        $('.col-collapse-left-activity, #show-activity-path').on('click', function (event) {
            var col = $('#col-left'),
                expandCollapseElement = $('.col-collapse-left-activity'),
                expandedWidth = col.css('max-width') != 'none'? col.css('max-width'): col.css('width'),
                collapsedWidth = 20,
                currentWidth = col.width();
            if (currentWidth > collapsedWidth) {
                col.animate(
                    {
                        width: collapsedWidth
                    },
                    {
                        duration: 500
                    }
                );
                expandCollapseElement.html('»');
            } else {
                col.find('div[id^="graph-"]').append('<div class="loading">Loading graph...</div>');
                col.animate(
                    {
                        width: expandedWidth
                    },
                    {
                        duration: 500,
                        complete: function(){
                            for(; i < pathArrayCount; i++) {
                                var nodeID = pathArray[i],
                                    highlightNodeID = pathArray[i+1];
                                mxGraphActivityViewer( document.getElementById('graph-'+nodeID), nodeID, highlightNodeID, configURL, siteAccess );
                            }
                            col.find('.loading').remove();
                        }
                    }
                );
                expandCollapseElement.html('«');
                
            }
            
            $('#col-left').on('click', function(event) {
                console.log( 'animation-end' );
            });
            
        });
        
        $('#where-am-i-button').on('click', function(){
            $('#where-am-i-map').toggle();
        });
        
        // Open details element before print
        var beforePrint = function() {
            console.log('Functionality to run before printing.');
        };
        var afterPrint = function() {
            console.log('Functionality to run after printing');
        };
    
        if (window.matchMedia) {
            var mediaQueryList = window.matchMedia('print');
            mediaQueryList.addListener(function(mql) {
                if (mql.matches) {
                    beforePrint();
                } else {
                    afterPrint();
                }
            });
        }
    
        window.onbeforeprint = beforePrint;
        window.onafterprint = afterPrint;
        
    });
    {/literal}-->
</script>

{/if}