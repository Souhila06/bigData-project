FROM python:3.8

# Install OpenJDK for ARM64
RUN apt-get update && \
    apt-get install -y default-jdk && \
    apt-get clean

# Find and set correct Java path
RUN update-alternatives --query java | grep 'Value:' | cut -d' ' -f2 > /tmp/java_path && \
    sed -i 's/jre\/bin\/java//' /tmp/java_path && \
    echo "export JAVA_HOME=$(cat /tmp/java_path)" >> ~/.bashrc

# Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH=$PATH:$JAVA_HOME/bin
ENV PYSPARK_PYTHON=/usr/local/bin/python
ENV PYSPARK_DRIVER_PYTHON=/usr/local/bin/python

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ /app/
COPY activities.parquet /activities.parquet

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
