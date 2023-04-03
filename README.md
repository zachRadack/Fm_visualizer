# Finite machine, Search visualizer 

This is a step by step search visualizer. It is currently under development. 

I did this by breaking the typically searches so they only do a single itteration (with some technical expections).

This will only every do the next step when you hit **"next step"**



It will go step by step to show how each search algorithem works

Here is depth first search
![image](https://user-images.githubusercontent.com/104032269/227746005-1c608ac0-056a-4f57-9fb9-2a6452b68261.png)

Here is Dijkstra
![image](https://user-images.githubusercontent.com/104032269/228747774-138e5850-ac7e-46e4-8b31-158163255a22.png)

# the colors are
**white** = generic unnoticed node

**Green (is observed)**= its currently looking at this node.

**blue (was computed)**= this node is currently in the algorithem list of moves

**red (visited)**= this is the current path or for dfs and bfs, it means that is has visited it

**purple (traversed)** = it has traversed, this is not used by dfs or bfs. 




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
