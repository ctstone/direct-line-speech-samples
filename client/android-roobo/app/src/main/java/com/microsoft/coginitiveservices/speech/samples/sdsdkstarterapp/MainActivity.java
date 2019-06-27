package com.microsoft.coginitiveservices.speech.samples.sdsdkstarterapp;


import android.content.Intent;

import android.content.res.AssetManager;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.text.Layout;
import android.text.TextUtils;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.microsoft.cognitiveservices.speech.ResultReason;
import com.microsoft.cognitiveservices.speech.SpeechRecognitionResult;
import com.microsoft.cognitiveservices.speech.audio.PullAudioOutputStream;
import com.microsoft.cognitiveservices.speech.dialog.SpeechBotConnector;
import com.microsoft.cognitiveservices.speech.dialog.BotConnectorConfig;
import com.microsoft.cognitiveservices.speech.KeywordRecognitionModel;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static com.microsoft.coginitiveservices.speech.samples.sdsdkstarterapp.LanguageCode.getCode;


public class MainActivity extends AppCompatActivity {

  // <settings>
  private static final String SpeechSubscriptionKey = "287ee14149294bb69b8adf849bb9856e";
  private static final String SpeechRegion = "westus";
  private static final String DirectLineSpeechSecret = "XGcud0aZ9uo.cwA.35A.PwxRMcPbKrLQvIYr66B-Ajze4ejfK6EJdgMKvQYDHiA";
  private static final String Keyword = "hey jio";
  private static final String KeywordModel = "Hey_Jio.zip"; // located in assets dir
  private static final String DeviceGeometry = "Circular6+1"; // "Circular6+1", "Linear4",
  private static final String SelectedGeometry = "Circular6+1"; // "Circular6+1", "Circular3+1", "Linear4", "Linear2"
  private static String languageRecognition = "en-US";
  // </settings>

  private static final ExecutorService pool = Executors.newCachedThreadPool();
  private static final String logTag = "APP";
  private static final String delimiter = "\n";

  static final int SELECT_RECOGNIZE_LANGUAGE_REQUEST = 0;
  static final int SELECT_TRANSLATE_LANGUAGE_REQUEST = 1;

  private final ArrayList<String> content = new ArrayList<>();
  private boolean continuousListeningStarted = false;
  private String buttonText = "";

  private TextView recognizedTextView;
  private Button recognizeKwsButton;
  private TextView recognizeLanguageTextView;
  private AssetManager assets;
  private SpeechBotConnector botConnector;
  private TextView statusTextView;

  private AudioConfig getAudioConfig() {
    return AudioConfig.fromDefaultMicrophoneInput();
  }

  private static BotConnectorConfig getSpeechBotConfig() {
    BotConnectorConfig botConnectorConfig = BotConnectorConfig.fromSecretKey(DirectLineSpeechSecret, SpeechSubscriptionKey, SpeechRegion);

    // PMA parameters
    botConnectorConfig.setProperty("DeviceGeometry", DeviceGeometry);
    botConnectorConfig.setProperty("SelectedGeometry", SelectedGeometry);
    botConnectorConfig.setSpeechRecognitionLanguage(languageRecognition);

    return botConnectorConfig;
  }

  public boolean onCreateOptionsMenu(Menu menu){
    getMenuInflater().inflate(R.menu.settingmenu,menu);
    return true;
  }

  public boolean onOptionsItemSelected(MenuItem item){
    switch(item.getItemId()){
      case R.id.RecoLanguage : {
        Intent selectLanguageIntent = new Intent(this,listLanguage.class);
        selectLanguageIntent.putExtra("RecognizeOrTranslate", SELECT_RECOGNIZE_LANGUAGE_REQUEST);
        startActivityForResult(selectLanguageIntent, SELECT_RECOGNIZE_LANGUAGE_REQUEST);
        return true;
      }
      case R.id.TranLanguage :{
        Intent selectLanguageIntent = new Intent(this, listLanguage.class);
        selectLanguageIntent.putExtra("RecognizeOrTranslate", SELECT_TRANSLATE_LANGUAGE_REQUEST);
        startActivityForResult(selectLanguageIntent, SELECT_TRANSLATE_LANGUAGE_REQUEST);
        return true;
      }
      default:
        return super.onContextItemSelected(item);
    }
  }

  public void onClickListen(View view) {
    disableButtons();

    if (continuousListeningStarted) {
      stopBotConnector();
    } else {
      startBotConnector();
    }
  }



  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    recognizedTextView = findViewById(R.id.recognizedText);
    recognizeKwsButton = findViewById(R.id.buttonRecognizeKws);
    recognizedTextView.setMovementMethod(new ScrollingMovementMethod());
    recognizeLanguageTextView = findViewById(R.id.textViewRecognitionLanguage);
    statusTextView = findViewById(R.id.textStatus);
    Toolbar mainToolbar = findViewById(R.id.mainToolbar);

    setSupportActionBar(mainToolbar);
    assets = this.getAssets();

    disableButtons();
    startBotConnector();
  }


  private void startBotConnector() {

    if(!checkSystemTime()) {
      return;
    }

    clearRecognizedText();
    clearStatusText();

    botConnector = new SpeechBotConnector(getSpeechBotConfig(), getAudioConfig());

    botConnector.recognizing.addEventListener((o, args) -> {
      SpeechRecognitionResult result = args.getResult();
      String text = result.getText();
      ResultReason reason = result.getReason();
      Log.i(logTag, String.format("[ Recognizing ] text: %s (reason %s)", text, reason));

      switch (reason) {
        case RecognizingKeyword:
          setStatusText("Keyword \"%s\" detected!", Keyword);
          break;

        case RecognizingSpeech:
          setStatusText(text);
          break;
      }
    });

    botConnector.recognized.addEventListener((o, args) -> {
      SpeechRecognitionResult result = args.getResult();
      String text = result.getText();
      ResultReason reason = result.getReason();
      Log.i(logTag, String.format("[ Recognized ] text: %s (reason: %s)", text, reason));

      if (reason == ResultReason.RecognizedSpeech) {
        appendRecognizedText("Recognized: \"%s\"", text);
      }

    });

    botConnector.activityReceived.addEventListener((o, args) -> {
      String activity = args.getActivity().serialize();
      String audioFlag = args.hasAudio() ? "with" : "without";
      Log.i(logTag, String.format("[ Activity ] (%s audio) -> %s", audioFlag, activity));

      appendRecognizedText(" -> %s", activity);
      appendRecognizedText("--------------------\n");

      if (args.hasAudio()) {
        setStatusText("Speaking…");
        playAudioStream(args.getAudio());
      }

      setStatusTextReady();

    });

    botConnector.canceled.addEventListener((o, args) -> {
      Log.i(logTag, String.format("[ Canceled ] code: %s; reason: %s; details: %s",
        args.getErrorCode(),
        args.getReason(),
        args.getErrorDetails()));
      setStatusText("Canceled (%s)", args.getReason());
    });

    botConnector.sessionStarted.addEventListener((o, args) -> {
      Log.i(logTag, String.format("[ Session Started ] %s",
        args.getSessionId()));
    });

    botConnector.sessionStopped.addEventListener((o, args) -> {
      Log.i(logTag, String.format("[ Session Stopped ] %s",
        args.getSessionId()));
    });

    try {
      KeywordRecognitionModel kwModel = KeywordRecognitionModel.fromStream(assets.open(KeywordModel), Keyword, true);
      Future<Void> connect = botConnector.connectAsync();
      Future<Void> start = botConnector.startKeywordRecognitionAsync(kwModel);
      setStatusText("Connecting...");
      setOnTaskCompletedListener(connect, (result1) -> {
        Log.i(logTag, String.format("Connected"));
        setOnTaskCompletedListener(start, (result2) -> {
          Log.i(logTag, String.format("Listening"));
          setStatusTextReady();
          notifyReady();
          continuousListeningStarted = true;
          MainActivity.this.runOnUiThread(() -> {
            buttonText = recognizeKwsButton.getText().toString();
            recognizeKwsButton.setText("Stop");
            recognizeKwsButton.setEnabled(true);
          });
        });
      });
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
      displayException(ex);
    }
  }

  private void notifyReady() {
    Uri soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
    Ringtone ringtone = RingtoneManager.getRingtone(getApplicationContext(), soundUri);
    ringtone.play();
  }

  private void stopBotConnector() {
    if (botConnector != null) {

      Future<Void> stop = botConnector.stopKeywordRecognitionAsync();
      Future<Void> disconnect = botConnector.disconnectAsync();

      setOnTaskCompletedListener(stop, (result1) -> {
        Log.i(logTag, "Stopped listening");
        setOnTaskCompletedListener(disconnect, (result2) -> {
          Log.i(logTag, "Disconnected");
          MainActivity.this.runOnUiThread(() -> recognizeKwsButton.setText(buttonText));
          enableButtons();
          continuousListeningStarted = false;
          setStatusTextReady();
        });
      });

    }
  }

  private void displayException(Exception ex) {
    String message = ex.getMessage();
    String traces = TextUtils.join(delimiter, ex.getStackTrace());
    recognizedTextView.setText(String.format("ERROR: %s\n\n%s", message, traces));
  }

  private void clearRecognizedText() {
    content.clear();
    showRecognizedText();
  }

  private void showRecognizedText() {
    final String text = TextUtils.join(delimiter, content);
    setTextbox(text);
  }

  private void appendRecognizedText(String format, Object... args) {
    final String text = String.format(format, args);
    content.add(text);
    showRecognizedText();
  }

  private void clearStatusText() {
    setStatusText("");
  }

  private void setStatusTextReady() {
    setStatusText("Ready! Say \"%s…\"", Keyword);
  }

  private void setStatusText(String format, Object... args) {
    final String text = String.format(format, args);
    MainActivity.this.runOnUiThread(() -> statusTextView.setText(text));
  }

  private void setTextbox(final String s) {
    MainActivity.this.runOnUiThread(() -> {
      recognizedTextView.setText(s);

      final Layout layout = recognizedTextView.getLayout();
      if(layout != null) {
        int scrollDelta
          = layout.getLineBottom(recognizedTextView.getLineCount() - 1)
          - recognizedTextView.getScrollY() - recognizedTextView.getHeight();
        if (scrollDelta > 0) {
          recognizedTextView.scrollBy(0, scrollDelta);
        }
      }
    });
  }

  private void disableButtons() {
    MainActivity.this.runOnUiThread(() -> {
      recognizeKwsButton.setEnabled(false);
    });
  }

  private void enableButtons() {
    MainActivity.this.runOnUiThread(() -> {
      recognizeKwsButton.setEnabled(true);
    });
  }

  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (requestCode == SELECT_RECOGNIZE_LANGUAGE_REQUEST) {
      if (resultCode == RESULT_OK) {
        String language = data.getStringExtra("language");
        languageRecognition = getCode(0,language);
        recognizeLanguageTextView.setText(language);
      }
    }
  }

  private <T> void setOnTaskCompletedListener(Future<T> task, OnTaskCompletedListener<T> listener) {
    pool.submit(() -> {
      T result = task.get();
      listener.onCompleted(result);
      return null;
    });
  }

  private boolean checkSystemTime(){
    Calendar calendar = Calendar.getInstance();
    SimpleDateFormat simpledateformat = new SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
    String date = simpledateformat.format(calendar.getTime());
    String year = date.substring(6,10);
    Log.i("System time" , date);
    if(Integer.valueOf(year) < 2018){
      Log.i("System time" , "Please synchronize system time");
      setTextbox("System time is " + date + "\n" +"Please synchronize system time");
      return false;
    }
    return true;
  }

  private interface OnTaskCompletedListener<T> {
    void onCompleted(T taskResult);
  }

  private static byte[] getWavHeader() {
    short int32 = Integer.SIZE / Byte.SIZE;
    short int16 = Short.SIZE / Byte.SIZE;
    byte[] chunkId = "RIFF".getBytes(StandardCharsets.US_ASCII);
    byte[] format = "WAVE".getBytes(StandardCharsets.US_ASCII);
    byte[] subchunk1Id = "fmt ".getBytes(StandardCharsets.US_ASCII);
    byte[] data = "data".getBytes(StandardCharsets.US_ASCII);
    int size
      = chunkId.length // Chunk Id
      + int32 // Chunk Size
      + format.length // Format
      + subchunk1Id.length // Subchunk1 Id
      + int32 // Subchunk1 Size
      + int16 // Audio Format
      + int16 // Num Channels
      + int32 // Sample Rate
      + int32 // Byte Rate
      + int16 // Block Align
      + int16 // Bits per Sample
      + data.length // Subchunk2 Id
      + int32 // Subchunk2 Size
      ;
    return ByteBuffer.allocate(size)
      .put(chunkId) // Chunk Id
      .putInt(Integer.MAX_VALUE) // Chunk Size
      .put(format) // Format
      .put(subchunk1Id) // Subchunk1 Id
      .putInt(16) // Subchunk1 Size
      .putShort((short)1) // AudioFormat
      .putShort((short)1) // Num Channels
      .putInt(16000) // Sample Rate
      .putInt(32000) // Byte Rate
      .putShort((short)2) // Block Align
      .putShort((short)16) // Bits per Sample
      .put(data) // Subchunk2 Id
      .putInt(Integer.MAX_VALUE) // Subchunk2 Size
      .array();
  }

  private static void playAudioStream(PullAudioOutputStream audio) {
    int sampleRate = 16000;
    int bufferSize = AudioTrack.getMinBufferSize(
      sampleRate,
      AudioFormat.CHANNEL_OUT_MONO,
      AudioFormat.ENCODING_PCM_16BIT);

    Log.i("AUDIO", String.format("Playing audio"));

    AudioTrack player = new AudioTrack(
      AudioManager.STREAM_MUSIC,
      sampleRate,
      AudioFormat.CHANNEL_OUT_MONO,
      AudioFormat.ENCODING_PCM_16BIT,
      bufferSize,
      AudioTrack.MODE_STREAM);
    player.play();

    byte[] header = getWavHeader();
    player.write(header, 0, header.length);

    long bytesRead;
    byte[] buffer = new byte[bufferSize];
    while ((bytesRead = audio.read(buffer)) > 0) {
      player.write(buffer, 0, (int)bytesRead);
    }

    player.stop();
    player.release();

    Log.i("AUDIO", String.format("Done with audio"));
  }
}
