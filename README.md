# Finite machine, Search visualizer 

This is a step by step search visualizer. 
Capable of producing its own random graphs, making your own custom json graphs, or even just editing a random produced json!

I did this by breaking the typically searches so they only do a single itteration (with some technical expections).

This will only every do the next step when you hit **"next step"**

Shows even the distance finding aspect of Astar.

It will go step by step to show how each search algorithem works

Here is depth first search
![image](https://user-images.githubusercontent.com/104032269/230284071-b4b60060-e300-4c09-86c9-93e5b73ee49d.png)

Here is Dijkstra
![image](https://user-images.githubusercontent.com/104032269/230284156-5da13b3d-9e6d-4fe5-a3b6-42b4f3fd204c.png)

Astar has 2 phases, one where it goes through showing distances of every node to the goal 

![image](https://user-images.githubusercontent.com/104032269/230284559-9972dca3-c375-442a-ae7e-4f7e4a1f896a.png)


Then it has the normal phase

![image](https://user-images.githubusercontent.com/104032269/230284640-249aefb7-82d3-4029-b2b9-f9717c6944fb.png)


# the colors are
**white** = generic unnoticed node

**Green (is observed)**= its currently looking at this node.

**blue (was computed)**= this node is currently in the algorithem list of moves

**red (visited)**= this is the current path or for dfs and bfs, it means that is has visited it

**purple (traversed)** = it has traversed, this is not used by dfs or bfs. 

**Yellow (finding distance)** - used by Astar


# There is currently:
depth first search

breadth first search

Dijkstra

A star


# Simulation mode

This program does not use D3, but rather my own custom made force layout. It is really not optimal or optimized. Node Simulation can be turned off, and it is off by default. beware of using it as of time of writting.

# How to use

It is currently just an HTML file, run the HTML and your good.

# Disclaimer


Due to how this was written, **depth first search** will always try to go with the latest move it has observered, which should usually always be whatever node is currently the highest number. **Breadth first search** has the inverse problem, though it seems to usually be less noticable.
