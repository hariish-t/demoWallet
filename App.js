name: Android Build
on:
  push:
    branches:
      - main
  workflow_dispatch:
jobs:
  build:
    name: Build Release APK
    runs-on: ubuntu-latest
    steps:
      # 1️⃣ Checkout code
      - uses: actions/checkout@v3
      
      # 2️⃣ Setup JDK
      - uses: actions/setup-java@v3
        with:
          distribution: temurin
          java-version: 17
          
      # 3️⃣ Setup Node
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          
      # 4️⃣ Install Yarn
      - run: npm install -g yarn
      
      # 5️⃣ Cache node_modules
      - uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-modules-${{ hashFiles('**/yarn.lock') }}
          
      # 6️⃣ Install dependencies
      - run: yarn install --frozen-lockfile
      
      # 7️⃣ Set NODE_BINARY for Gradle
      - name: Set NODE_BINARY
        run: echo "NODE_BINARY=$(which node)" >> $GITHUB_ENV
        
      # 8️⃣ Clean Gradle
      - name: Clean Gradle
        run: cd android && ./gradlew clean && cd ..
        
      # 9️⃣ Enable HTTP cleartext for Ganache connection
      - name: Enable HTTP cleartext traffic
        run: |
          # Create network security config to allow HTTP to local IP
          mkdir -p android/app/src/main/res/xml
          cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
          <?xml version="1.0" encoding="utf-8"?>
          <network-security-config>
              <domain-config cleartextTrafficPermitted="true">
                  <domain includeSubdomains="true">10.15.244.52</domain>
              </domain-config>
          </network-security-config>
          EOF
          
          # Add network security config reference to AndroidManifest.xml
          sed -i 's/<application/<application android:networkSecurityConfig="@xml\/network_security_config"/' android/app/src/main/AndroidManifest.xml
          
      # 🔟 Bundle React Native assets
      - name: Bundle React Native assets
        run: |
          mkdir -p android/app/src/main/assets
          npx react-native bundle \
            --platform android \
            --dev false \
            --entry-file index.js \
            --bundle-output android/app/src/main/assets/index.android.bundle \
            --assets-dest android/app/src/main/res \
            --reset-cache
            
      # 🔟 Setup Android SDK
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        
      # 1️⃣1️⃣ Install Android SDK & NDK
      - name: Install Android SDK & NDK
        run: |
          yes | sdkmanager \
            "platform-tools" \
            "platforms;android-34" \
            "build-tools;34.0.0" \
            "ndk;27.1.12297006"
            
      # 1️⃣2️⃣ Accept licenses
      - run: yes | sdkmanager --licenses
      
      # 1️⃣3️⃣ Build APK
      - name: Build APK
        run: cd android && ./gradlew assembleRelease --no-daemon --stacktrace
        
      # 1️⃣4️⃣ Upload artifact
      - uses: actions/upload-artifact@v4
        with:
          name: demoWallet-release-apk
          path: android/app/build/outputs/apk/release/app-release.apk
