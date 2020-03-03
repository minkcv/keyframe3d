# Keyframe3D Overview

This document provides an overview of the components that make up Keyframe3D.
It is recommended to read this document and then the tutorial documents in this folder.
[DISTRIBUTING.md](./DISTRIBUTING.md) explains how to embed an animation in a web page.
The name 'Keyframe3D' is used to refer to the animation editor.
The name 'Keyframe3D Player' is used to refer to the animation player.

## Key Concepts

* An animation has a length in frames, and is played at a framerate (frames per second). 
* A scene contains a tree of nodes. Nodes can be cameras, models, shapes, or empty. 
* Nodes have a transform in 3D space consisting of a position, rotation, and scale.
* Nodes can be children of other nodes and inherit the transforms of their parents.
* Rotated nodes of non-uniformly scaled parents may be deformed.
* Keyframes are data at a specific time that is used to determine the transform of nodes in the scene.
* A keyframe may contain position, rotation, and/or scale data.
* A node's transform is determined by the keyframes with data for that node at the current time, a time before and after, or a time before or after.
* If a node has a keyframe with data for it at the current time, then it's transform is the data in the keyframe.
* If a node has a keyframe with data for it before and after the current time, then it's transform is interpolated between the two keyframe's data.
* If a node has no keyframes with data for it then it has the default local transform (position: origin, rotation: facing toward -Z).
* A node with a model can have its visibility keyframed to visibile or non visible. This value updates at and after a keyframe and does not apply to children.
* A scene can have multiple cameras but the camera used at a specific time is dependent on the key camera set in the current or most recent keyframe.
* Different cameras can have different field of views, but the aspect ratio of the animation is fixed.

## Welcome Screen

A welcome screen will be displayed the first time you open Keyframe3D. It has links to this documentation, sample projects, Line3D, and other resources.
You can uncheck the 'Show this welcome message every time' checkbox to prevent it from opening every time you load the page.
You can reopen the welcome screen from the button 'Open Welcome Screen' located in the File pane.
You can close the welcome screen with the 'x' on the 'Welcome to Keyframe3D' tab at the top.

## File Pane

The 'Load Project' and 'Save Project' buttons in the File pane will prompt to load or save a json file. This file contains the project settings, models, scene tree, and keyframes. This is also the file that will be loaded by the Keyframe3D Player.
The 'Open Viewport' button opens an additional 3D viewport.

## Settings

The Settings pane contains settings for the length (in frames) and framerate of the animation, aspect ratio of the camera, if the animation should play automatically, and if the animation should loop.
The animation length cannot be less than 1.
The framerate cannot be greater than 60 and cannot be less than 1.
The aspect ratio should be entered as `width:height`. 
The line color and background color can be set using hexadecimal color codes. A web search for 'hex color picker' can help with this.
Note that these colors only appy for the view from scene cameras and are not used for the free cameras.
The 'Apply' button must be clicked after changes are made in the Settings pane.

## Scene Tree Controls

The Scene Tree Controls pane contains buttons for creating, renaming, and deleting nodes, as well as creating camera nodes.
All the buttons operate on the currently selected node in the Scene Tree. 
Buttons 'Create Node', and 'Create Camera' will use the name field for the name of the new node, or an automatic name.
The names `root`, `default camera`, `key camera`, and `free camera` are reserved.
The 'Create Node' button creates a new node empty node.
The 'Rename Node' button renames the currently selected node to the name in the 'name' field.
The 'Delete Node' button deletes the currently selected node and ALL of its children and ALL keyframe data for that node and its children.
The 'Create Camera' button creates a new scene camera.
The 'Duplicate Node' button duplicates the selected node and its children at the same level as the selected node.

## Scene Tree

The Scene Tree pane contains a hierarchy of nodes that exist in the scene. Nodes can be selected by left clicking on them. 
Selecting a node will show its properties in the Properties pane, highlight it and show its transform controls in the 3D viewports.
Nodes can be dragged in the Scene Tree to change their parent. Drag a node onto another to set the dragged node's parent to the one it is dragged onto.
The root node has no parent and cannot be made the child of another node. Every node except the root node must have a parent.
A node that is a child of another node will have it's transform affected by the parent's transform. 
For example, a child node that has position x: -10, y: 0, z: 0, with a parent with position x: 50, y: 0, z:0, will have a world position of x: 40, y: 0, z: 0.

## Models

The Models pane contains a list of loaded models and buttons for loading and unloading models from the project, as well as adding models to the scene.
The model list will contain the 'default-cube' model for a new project.
Models can be loaded by clicking the 'Load Model' button and browsing for a Line3D JSON model.
Models can be added to the scene by selecting a model from the list and clicking the 'Add To Scene' button to create a new node with the model.
The 'Apply To Selected' button will change the model of the currently selected node to the model selected from the list.
The 'Remove From Selected' button will remove the model from the currently selected node.
Models can be unloaded from the project by selecting a model from the list and clicking the 'Unload Model' button. This removes the model from all nodes that used that model.

## Shapes

The Shapes pane is similar to the models pane except that it is for 2D shapes.
These shapes can be used to cover up model lines and will have the same color as the background.
Shapes can be saved from Line3D by selecting a loop of connected points and choosing 'Save Selected Shape JSON'.

## Properties

The Properties pane shows the x, y, and z position, x, y, and z rotation, and x, y, and z scale of the selected node. 
If the node has a model, the properties will show the visibility of the model.
Changing the fields in the Properties pane will update the values of the selected node live, but will not keyframe the properties.
The properties pane will show the vertical field of view (FOV) of a scene camera if one is selected.
A change to the camera field of view is saved to the camera and is independent of keyframes.

## Controls

The Controls pane contains buttons for changing between position and rotation transform controls, modifying keyframes, and for seeking around the timeline.
The current time is displayed in frames.
The 'Play' button causes the current time to advance at the framerate set in the settings.
The 'Pause' button stops the playback at the current time.
The 'Stop' button stops the playback and seeks to time 0.
The 'Seek To Time' button sets the current time to the time entered into the 'time' field.
Buttons for modifying or seeking to keyframes are dependent on the settings for which nodes and what data.
Keyframes can be modified for 'All Nodes', the 'Selected' node, or the 'Selected And Child' nodes from the drop down menu.
Keyframes can be modified for any combination of 'Position', 'Rotation', 'Scaling', and/or 'Visibility'.
A keyframe can be set at the current time using the 'Set Keyframe' button.
The current keyframe data can be copied to a keyframe at another time using the 'Copy Keyframe' button and the 'time' field.
The current keyframe data can be removed using the 'Remove Keyframe' button.
The current time can be moved to the next or previous keyframe that contains data using the 'Seek Next Keyframe' and 'Seek Previous Keyframe' buttons.
The key camera can be set at the current time using the 'Set Camera' button and using the drop down menu to select the camera.

## Viewports

Viewports display the scene, either from a free camera for transforming objects, from the scene cameras, or from the key camera.
Additional Viewports can be opened from the 'Add Viewport' button in the File pane.
The drop down menu in the top right is used to change between free camera, the scene cameras, or the key camera.
When the view is set to a scene camera or the key camera, the view will use the aspect ratio set in the settings.
When the view is set to key camera, the view will show the scene from the key camera set in the current or closest previous keyframe.
Right mouse is used to rotate the free camera view. Middle mouse is used to pan the free camera.
Scroll the mouse wheel to zoom the free camera in and out.
The buttons 'Top', 'Front', 'Side', and 'Iso' set the free camera to a specific angle.
The buttons 'Recenter World' and 'Recenter Selected' move the free camera to the world origin, or the world position of the selected node.

## Timeline

The Timeline pane shows a range of frames from 0 to length - 1, a playhead at the current time, and dots for keyframes.
The dots for keyframes are displayed slightly ahead of the vertical line for a time.
Left click on the top area of the timeline to seek directly to that time.
Click and drag the playhead left or right to seek to a time while updating the scene live. This is referred to as 'scrubbing'.
Scroll the mouse wheel to zoom in or out on the timeline.
Click and drag the timeline to pan around when zoomed in.

## Log

The Log pane shows a list of previous actions. 
