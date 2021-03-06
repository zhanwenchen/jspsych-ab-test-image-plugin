/**
 * jspsych-image-button-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["ab-test"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('ab-test', 'images', 'image');

  plugin.info = {
    name: 'ab-test',
    description: '',
    parameters: {
      // stimuli: {
      //   type: jsPsych.plugins.parameterType.IMAGE,
      //   pretty_name: 'Stimuli',
      //   default: undefined,
      //   description: 'The images to be displayed'
      // },
      // stimulus: {
      //   type: jsPsych.plugins.parameterType.IMAGE,
      //   pretty_name: 'Stimulus',
      //   default: undefined,
      //   description: 'The image to be displayed'
      // },
      images: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Images',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        // Default button html for all buttons. Later customize each
        // according to "choices," replacing the magic string %choice%.
        // default: '<button class="jspsych-btn" >%choice%</button>',
        // default: '<button class="jspsych-btn" style="background: url(%image_url%)">%choice%</button>',
        default: '<button class="jspsych-btn"><img src="%image_url%" title="%image_url%"></button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    if(typeof trial.images === 'undefined'){
      console.error('Required parameter "images" missing in image-button-response');
    }
    // if(typeof trial.stimulus === 'undefined'){
    //   console.error('Required parameter "stimulus" missing in image-button-response');
    // }

    // display stimulus
    var trial_progress = jsPsych.progress();
    var html = `<p>Trial ${trial_progress.current_trial_global} of ${trial_progress.total_trials}</p>`;
    // html += '<img src="'+trial.images[1]+'" id="jspsych-image-button-response-stimulus"></img>';

    // `<button style="background: url(${images[0]})"/>`
    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.images.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the images array');
      }
    } else {
      for (var i = 0; i < trial.images.length; i++) {
        buttons.push(trial.button_html);
      }

      // CHANGED: add final button for a third option. This is accessed by last.
      buttons.push(trial.button_html);
    }
    html += '<div id="jspsych-image-button-response-btngroup">';
    // var html = '<div id="jspsych-image-button-response-btngroup">';

    for (var i = 0; i < trial.images.length; i++) {
      // var str = buttons[i].replace(/%choice%/g, trial.images[i]).replace(/%image_url%/g, trial.images[i]);
      var str = buttons[i].replace(/%image_url%/g, trial.images[i]);
      html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-ab-test-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }

    i = trial.images.length;
    var str = '<button class="jspsych-btn">They are similar</button>';
    html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-ab-test-button-' + i +'" data-choice="'+i+'">'+str+'</div>';

    html += '</div>';

    //show prompt if there is one
    if (trial.prompt !== null) {
      html += trial.prompt;
    }

    display_element.innerHTML = html;

    // start timing
    var start_time = Date.now();

    // Add cilck handlers
    for (var i = 0; i < trial.images.length+1; i++) {
      display_element.querySelector('#jspsych-ab-test-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        console.log('choice is ' + choice)
        after_response(choice);
      });
    }

    // store response
    var response = {
      rt: null,
      button: null
    };

    // function to handle responses by the subject
    function after_response(choice) {

      // measure rt
      var end_time = Date.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      // display_element.querySelector('#jspsych-image-button-response-stimulus').className += ' responded';

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-image-button-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        // btns[i].setAttribute('disabled', 'disabled'); // Disabling button also disables user changing mind and going back.
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button,
        images: trial.images,
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };



    // hide image if timing is set
    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-image-button-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
