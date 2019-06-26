package com.microsoft.coginitiveservices.speech.samples.sdsdkstarterapp;


import android.content.Intent;

import android.content.res.AssetManager;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
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

import com.microsoft.cognitiveservices.speech.audio.PullAudioOutputStream;
import com.microsoft.cognitiveservices.speech.dialog.SpeechBotConnector;
import com.microsoft.cognitiveservices.speech.dialog.BotConnectorConfig;
import com.microsoft.cognitiveservices.speech.KeywordRecognitionModel;
import com.microsoft.cognitiveservices.speech.SpeechConfig;
import com.microsoft.cognitiveservices.speech.SpeechRecognizer;
import com.microsoft.cognitiveservices.speech.audio.AudioConfig;
import com.microsoft.cognitiveservices.speech.ResultReason;

import java.math.BigInteger;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static com.microsoft.coginitiveservices.speech.samples.sdsdkstarterapp.LanguageCode.getCode;
import static com.microsoft.cognitiveservices.speech.ResultReason.RecognizedKeyword;
import static com.microsoft.cognitiveservices.speech.ResultReason.RecognizingSpeech;


public class MainActivity extends AppCompatActivity {

  // Subscription
  private final static String SpeechSubscriptionKey = "a7a87906a4c846afb629c3f978906606";
  private final static String SpeechRegion = "westus";
  private final static String DirectLineSpeechSecret = "XGcud0aZ9uo.cwA.35A.PwxRMcPbKrLQvIYr66B-Ajze4ejfK6EJdgMKvQYDHiA";

  private static String Keyword = "hey jio";
  private static String KeywordModel = "Hey_Jio.zip";

  private static String DeviceGeometry = "Circular6+1"; //"Circular6+1", "Linear4",
  private static String SelectedGeometry = "Circular6+1"; //"Circular6+1", "Circular3+1", "Linear4", "Linear2"

  private TextView recognizedTextView;
  private Button recognizeKwsButton;
  private TextView recognizeLanguageTextView;
  private static String languageRecognition = "en-US";
  static final int SELECT_RECOGNIZE_LANGUAGE_REQUEST = 0;
  static final int SELECT_TRANSLATE_LANGUAGE_REQUEST = 1;

  private static final String logTag = "kws";
  private static final String delimiter = "\n";
  private final ArrayList<String> content = new ArrayList<>();
  private boolean continuousListeningStarted = false;
  private SpeechRecognizer reco = null;
  private String buttonText = "";
  private AssetManager assets;
  private SpeechBotConnector botConnector;

  private AudioConfig getAudioConfig() {
    // run from the microphone
    return AudioConfig.fromDefaultMicrophoneInput();
  }

  private static SpeechConfig getSpeechConfig() {
    SpeechConfig speechConfig = SpeechConfig.fromSubscription(SpeechSubscriptionKey, SpeechRegion);

    // PMA parameters
    speechConfig.setProperty("DeviceGeometry", DeviceGeometry);
    speechConfig.setProperty("SelectedGeometry", SelectedGeometry);
    speechConfig.setSpeechRecognitionLanguage(languageRecognition);

    return speechConfig;
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
    if(!checkSystemTime()) {
      return;
    }

    disableButtons();


    // stop listening
    if (continuousListeningStarted) {
//      stopListening();
      stopBotConnector();
    } else {
//      startSpeechRecognizer();
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
    Toolbar mainToolbar = findViewById(R.id.mainToolbar);

    setSupportActionBar(mainToolbar);

    // save the asset manager
    assets = this.getAssets();
  }

  private void stopListening() {
    if (reco != null) {
      final Future<Void> task = reco.stopKeywordRecognitionAsync();

      setOnTaskCompletedListener(task, result -> {
        Log.i(logTag, "Continuous recognition stopped.");
        MainActivity.this.runOnUiThread(() -> recognizeKwsButton.setText(buttonText));
        enableButtons();
        continuousListeningStarted = false;
      });
    } else {
      continuousListeningStarted = false;
    }
  }

  private void startBotConnector() {
    botConnector = new SpeechBotConnector(getSpeechBotConfig(), getAudioConfig());

    botConnector.recognizing.addEventListener((o, args) -> {
      String text = args.getResult().getText();
      Log.i(logTag, String.format("[ Recognizing ] text: %s", text));
    });

    botConnector.recognized.addEventListener((o, args) -> {
      String text = args.getResult().getText();
      Log.i(logTag, String.format("[ Recognized ] text: %s", text));
    });

    botConnector.activityReceived.addEventListener((o, args) -> {
      String activity = args.getActivity().serialize();
      String audioFlag = args.hasAudio() ? "with" : "without";
      Log.i(logTag, String.format("[ Activity ] (%s audio) -> %s", audioFlag, activity));
      if (args.hasAudio()) {
        playAudioStream(args.getAudio());
      }
    });


    try {
      KeywordRecognitionModel kwModel = KeywordRecognitionModel.fromStream(assets.open(KeywordModel), Keyword, true);
      Future<Void> connect = botConnector.connectAsync();
      Future<Void> start = botConnector.startKeywordRecognitionAsync(kwModel);
      setOnTaskCompletedListener(connect, (result1) -> {
        Log.i(logTag, String.format("Connected"));
        setOnTaskCompletedListener(start, (result2) -> {
          Log.i(logTag, String.format("Listening"));
        });
      });
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
      displayException(ex);
    }
  }

  private void stopBotConnector() {
    if (botConnector != null) {
      try {
        botConnector.stopKeywordRecognitionAsync().wait();
        botConnector.disconnectAsync().wait();
      } catch (InterruptedException ex) {
        System.out.println(ex.getMessage());
        displayException(ex);
      }
    }
  }

  private void startSpeechRecognizer() {
    clearTextBox();

    content.clear();
    content.add("");
    content.add("");

    try {
      reco = new SpeechRecognizer(getSpeechConfig(), getAudioConfig());


      // on session started
      reco.sessionStarted.addEventListener((o, args) -> {
        Log.i(logTag, String.format("[ sessionStarted ] sessionId: (%s)", args.getSessionId()));

        content.set(0, String.format("KeywordModel `%s` detected", Keyword));
        setRecognizedText(TextUtils.join(delimiter, content));
      });

      // on session stoped
      reco.sessionStopped.addEventListener((o, args) -> {
        Log.i(logTag, String.format("[ sessionStopped ] sessionId %s (", args.getSessionId()));
      });

      // on recognizing
      reco.recognizing.addEventListener((o, args) -> {
        String text = args.getResult().getText();
        ResultReason reason = args.getResult().getReason();
        Log.i(logTag, String.format("[ recognizing ] text: %s (reason: %s)", text + reason));

        if (reason == RecognizingSpeech) {
          Integer index = content.size() - 2;
          content.set(index + 1, String.format("%s. %s", index, text));
          setRecognizedText(TextUtils.join(delimiter, content));
        }
      });

      // on recognized
      reco.recognized.addEventListener((o, args) -> {
        String text = args.getResult().getText();
        ResultReason reason = args.getResult().getReason();
        Log.i(logTag, String.format("[ recognized ] Final result: '%s' (reason %s)", text, reason));

        if (reason == RecognizedKeyword) {
          content.add("");
        }
        if (!text.isEmpty()) {
          Integer index = content.size() - 2;
          content.set(index + 1, String.format("%s. %s", index, text));
          content.set(0, String.format("Say `%s`...", Keyword));
          setRecognizedText(TextUtils.join(delimiter, content));
        }
      });

      // on speech start
      reco.speechStartDetected.addEventListener((o, args) -> {
        String sessionId = args.getSessionId();
        BigInteger offset = args.offset;
        Log.i(logTag, String.format("[ speechStartDetected ] sessionId '%s' (offset: %s)", sessionId, offset));
      });

      // on speech end
      reco.speechEndDetected.addEventListener((o, args) -> {
        String sessionId = args.getSessionId();
        BigInteger offset = args.offset;
        Log.i(logTag, String.format("[ speechEndDetected ] sessionId '%s' (offset: %s)", sessionId, offset));
      });

      // start recognizing
      Log.i(logTag, "Starting keyword recognition...");
      final KeywordRecognitionModel keywordRecognitionModel = KeywordRecognitionModel.fromStream(assets.open(KeywordModel), Keyword, true);
      final Future<Void> task = reco.startKeywordRecognitionAsync(keywordRecognitionModel);
      setOnTaskCompletedListener(task, (result) -> {
        content.set(0, String.format("Say `%s`...", Keyword));
        setRecognizedText(TextUtils.join(delimiter, content));
        continuousListeningStarted = true;
        Log.i(logTag, "Keyword recognition started!");
        MainActivity.this.runOnUiThread(() -> {
          buttonText = recognizeKwsButton.getText().toString();
          recognizeKwsButton.setText("Stop");
          recognizeKwsButton.setEnabled(true);
        });
      });
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
      displayException(ex);
    }
  }

  private void displayException(Exception ex) {
    recognizedTextView.setText(ex.getMessage() + "\n" + TextUtils.join("\n", ex.getStackTrace()));
  }

  private void clearTextBox() {
    setTextbox("");
  }

  private void setRecognizedText(final String s) {
    setTextbox(s);
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
    if (requestCode == SELECT_TRANSLATE_LANGUAGE_REQUEST) {
      if (resultCode == RESULT_OK) {
        String language = data.getStringExtra("language");
      }
    }
  }

  private <T> void setOnTaskCompletedListener(Future<T> task, OnTaskCompletedListener<T> listener) {
    s_executorService.submit(() -> {
      T result = task.get();
      listener.onCompleted(result);
      return null;
    });
  }

  private interface OnTaskCompletedListener<T> {
    void onCompleted(T taskResult);
  }

  protected static ExecutorService s_executorService;
  static {
      s_executorService = Executors.newCachedThreadPool();
  }

  //make sure the system time is synchronized.
  public boolean checkSystemTime(){
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

  private static void playAudioStream(PullAudioOutputStream audio) {
    int sampleRate = 16000;
    int bufferSize = AudioTrack.getMinBufferSize(sampleRate, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_16BIT);

    AudioTrack player = new AudioTrack(
      AudioManager.STREAM_MUSIC,
      sampleRate,
      AudioFormat.CHANNEL_OUT_MONO,
      AudioFormat.ENCODING_PCM_16BIT,
      bufferSize,
      AudioTrack.MODE_STATIC);

    byte[] buffer = new byte[bufferSize];
    long bytesRead;

    while ((bytesRead = audio.read(buffer)) > 0) {
      player.write(buffer, 0, (int)bytesRead);
    }


//    final AudioFormat format = new AudioFormat(AudioFormat.Encoding.PCM_SIGNED, audioFormat.getSamplesPerSecond(),
//      audioFormat.getBitsPerSample(), audioFormat.getChannels(), audioFormat.getFrameSize(),
//      audioFormat.getSamplesPerSecond(), false);
//    try {
//      int bufferSize = format.getFrameSize();
//      final byte[] data = new byte[bufferSize];
//
//      SourceDataLine.Info info = new DataLine.Info(SourceDataLine.class, format);
//      SourceDataLine line = (SourceDataLine) AudioSystem.getLine(info);
//      line.open(format);
//
//      if (line != null) {
//        line.start();
//        int nBytesRead = 0;
//        while (nBytesRead != -1) {
//          nBytesRead = stream.read(data);
//          if (nBytesRead != -1) {
//            line.write(data, 0, nBytesRead);
//          }
//        }
//        line.drain();
//        line.stop();
//        line.close();
//      }
//      stream.close();
//
//    } catch (Exception e) {
//      e.printStackTrace();
//    }
  }
}
