# Finite machine, Search visualizer 

This is a step by step search visualizer. It is currently under development. 

I did this by breaking the typically searches so they only do a single itteration (with some technical expections).

This will only every do the next step when you hit **"next step"**



It will go step by step to show how each search algorithem works


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




# Disclaimer


Due to how this was written, **depth first search** will always try to go with the latest move it has observered, which should usually always be whatever node is currently the highest number. **Breadth first search** has the inverse problem, though it seems to usually be less noticable.
