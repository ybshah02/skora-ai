FROM python:3.11.4
ENV PYTHONUNBUFFERED True

RUN apt-get update 
RUN apt-get update && apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libegl1-mesa \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    libgbm-dev \
    chromium \
    chromium-driver \
    dbus \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN chmod +x /usr/bin/chromium

RUN service dbus start 

RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install necessary tools for installing Chromium
#RUN apt-get update && apt-get install -y wget gnupg curl ca-certificates

# Install Chromium
# RUN apt-get install -y chromium chromium-chromedriver

ENV APP_HOME /root/app
WORKDIR $APP_HOME
COPY . $APP_HOME

EXPOSE 8080
# CMD ["python3", "main.py"]

RUN chmod +x run.sh
CMD ["./run.sh"]
