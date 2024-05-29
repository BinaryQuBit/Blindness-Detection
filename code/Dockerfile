FROM debian:bullseye-slim

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/

RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

RUN pip3 install tflite-runtime

WORKDIR /usr/src/app

COPY ./backend ./backend

EXPOSE 86

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:86", "-t", "300", "backend.server:app"]