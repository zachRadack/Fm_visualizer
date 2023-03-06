# Goals-Website

This is a Docker contained flask run HTML for a finite machine visualizer site

In order to update the docker file run 

```
docker build -t myflaskapp .
docker run -i --rm --name myflaskappcontainer -p 5000:5000 -v "$PWD/fm_vm:/app" myflaskapp:latest 
```
Or if you wanna do it all at once
```
docker build -t myflaskapp .;docker run -i --rm --name myflaskappcontainer -p 5000:5000 -v "$PWD/fm_vm:/app" myflaskapp:latest 
```



I seem to sometimes run into a few issues so I will be putting a few methods I have used to resolve them

IF you wish to run just the html and due to docker issues just run the app.py file like normal or you can run 
```
flask run
```

1. http://0.0.0.0:5000/ returns nothing when I open it in my browser

Use this in the browser URL instead
```
    localhost:5000
```
2.pip install -r requirements.txt

Sometimes requirements acts werid and a little derpy, never a bad idea to do this

also make sure the requirements you add actually are compatiable with other stuff (cough MarkupSafe and itsdangerous)

