# Use an official Python runtime as the base image
FROM python:3.9-slim-buster

RUN python3 -m pip install flask

# Set the working directory to /flask-docker
WORKDIR /flask-docker


RUN python3 -m pip install --upgrade pip



# Copy the requirements.txt file to the container
COPY requirements.txt requirements.txt

# Install the required packages
RUN pip3 install -r requirements.txt

# Copy the rest of the application files to the container
COPY . .

# Expose port 5000 for the Flask application to listen on
EXPOSE 5000

# Run the command to start the Flask application
CMD ["flask", "run", "--host=0.0.0.0"]
