/**
 * CallDetailsSection Component
 *
 * Displays detailed information about a selected call including:
 * - Call analysis with extracted candidate information
 * - Call recording player
 * - Call transcript
 *
 * @param {Object} call - The call object containing all call data
 * @param {Function} onBack - Callback function to return to call list
 */

import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Play, Download, FileText } from 'lucide-react';

const CallDetailsSection = ({ call, onBack, styles }) => {
  // Use ref to track if we've already logged this call
  const loggedCallId = useRef(null);

  // Return null if no call data is provided
  if (!call) {
    console.log('⚠️ CallDetailsSection - No call data provided');
    return null;
  }

  // Handle if call is an array (extract first element)
  const callData = Array.isArray(call) ? call[0] : call;

  // Log only once when call changes
  useEffect(() => {
    const currentCallId = callData.id || JSON.stringify(callData);

    // Only log if this is a different call
    if (loggedCallId.current !== currentCallId) {
      console.log('\n🔍 ========== CALL DETAILS LOADED ==========');
      console.log('🔍 CallDetailsSection - Full Call Object:', callData);
      console.log('🔍 CallDetailsSection - Call Keys:', Object.keys(callData));

      // Extract and log key information
      const phoneNumber = callData.to_number || callData.from_number || callData.customer?.number || callData.phone_number || 'Unknown';
      const callStatus = callData.call_status || callData.status || 'unknown';
      let analysis = callData.extracted_variables || callData.analysis || callData.call_analysis || {};

      if (Array.isArray(analysis)) {
        analysis = analysis.length > 0 ? analysis[0] : {};
      }

      console.log('📞 Phone Number:', phoneNumber);
      console.log('📊 Status:', callStatus);
      console.log('📊 Analysis Object:', analysis);
      console.log('📊 Analysis Keys:', Object.keys(analysis));
      console.log('📝 Transcript:', callData.call_conversation ? `Found (${callData.call_conversation.length} chars)` : 'No transcript');
      console.log('🎙️ Recording URL:', callData.recording_url || 'No recording URL');
      console.log('⏱️ Duration:', callData.call_duration || `${callData.call_duration_in_seconds || 0} seconds`);
      console.log('🔍 ==========================================\n');

      loggedCallId.current = currentCallId;
    }
  }, [callData]);

  // Extract phone number (OmniDim uses from_number and to_number)
  const phoneNumber = callData.to_number || callData.from_number || callData.customer?.number || callData.phone_number || 'Unknown';

  // Extract status
  const callStatus = callData.call_status || callData.status || 'unknown';

  // Extract analysis data (OmniDim uses extracted_variables)
  let analysis = callData.extracted_variables || callData.analysis || callData.call_analysis || {};

  // If analysis is an array, take the first element
  if (Array.isArray(analysis)) {
    analysis = analysis.length > 0 ? analysis[0] : {};
  }

  // Extract transcript (OmniDim uses call_conversation)
  const transcript =
    callData.call_conversation ||
    callData.transcript ||
    callData.artifact?.transcript ||
    callData.call_transcript ||
    '';

  // Extract recording URL (OmniDim uses recording_url)
  const recordingUrl =
    callData.recording_url ||
    callData.recordingUrl ||
    callData.artifact?.recordingUrl ||
    callData.artifact?.stereoRecordingUrl ||
    callData.artifact?.recording?.stereoUrl ||
    callData.artifact?.recording?.mono?.combinedUrl;

  // Get call duration (OmniDim provides call_duration in "M:SS" format and call_duration_in_seconds)
  let durationDisplay = '0:00';
  let durationSeconds = 0;

  // First, try to use the pre-formatted call_duration string
  if (callData.call_duration && typeof callData.call_duration === 'string') {
    // OmniDim provides duration in "M:SS" format (e.g., "1:7")
    const parts = callData.call_duration.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      durationDisplay = `${mins}:${secs.toString().padStart(2, '0')}`;
      durationSeconds = mins * 60 + secs;
    }
  } else if (callData.call_duration_in_seconds) {
    // OmniDim provides duration in seconds
    durationSeconds = callData.call_duration_in_seconds;
    durationDisplay = formatDuration(durationSeconds);
  } else if (callData.duration) {
    // If duration is directly provided
    durationSeconds = typeof callData.duration === 'number' ? callData.duration : parseInt(callData.duration) || 0;
    durationDisplay = formatDuration(durationSeconds);
  } else if (callData.ended_at && callData.started_at) {
    // Calculate from OmniDim timestamps
    durationSeconds = Math.round((new Date(callData.ended_at) - new Date(callData.started_at)) / 1000);
    durationDisplay = formatDuration(durationSeconds);
  } else if (callData.endedAt && callData.startedAt) {
    // Calculate from Vapi timestamps
    durationSeconds = Math.round((new Date(callData.endedAt) - new Date(callData.startedAt)) / 1000);
    durationDisplay = formatDuration(durationSeconds);
  }

  // Extract additional OmniDim specific fields
  const botName = callData.bot_name || 'AI Assistant';
  const callCost = callData.call_cost || callData.aggregated_estimated_cost || 0;
  const modelName = callData.model_name || 'Unknown';
  const asrService = callData.asr_service || 'Unknown';

  /**
   * Format duration from seconds to MM:SS ratio format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration string (e.g., "1:07" or "0:07")
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Helper function to format value for display
   */
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'Not extracted';
    if (typeof value === 'object' && !Array.isArray(value)) {
      return JSON.stringify(value, null, 2);
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  /**
   * Extracted candidate data from call analysis
   * Supports both camelCase and snake_case field names for flexibility
   */
  const extractedData = {};

  // If analysis object has data, extract it
  if (analysis && typeof analysis === 'object' && Object.keys(analysis).length > 0) {
    console.log('📋 Processing analysis data...');

    // Try standard field names first
    const fieldMappings = {
      'Candidate Name': ['candidateName', 'candidate_name', 'name', 'full_name', 'fullName'],
      'City Location': ['cityLocation', 'city_location', 'city', 'location'],
      'Position Applied': ['positionApplied', 'position_applied', 'position', 'job_title', 'jobTitle'],
      'Education Background': ['educationBackground', 'education_background', 'education', 'degree'],
      'Total Experience': ['totalExperience', 'total_experience', 'experience', 'years_of_experience', 'yearsOfExperience'],
      'Last Job Role': ['lastJobRole', 'last_job_role', 'job_role', 'current_role', 'currentRole'],
      'Key Skills': ['keySkills', 'key_skills', 'skills', 'technical_skills', 'technicalSkills'],
      'Motivation to Join': ['motivationToJoin', 'motivation_to_join', 'motivation', 'reason_to_join'],
      'Expected Salary': ['expectedSalary', 'expected_salary', 'salary', 'salary_expectation', 'salaryExpectation'],
      'Notice Period': ['noticePeriod', 'notice_period', 'availability', 'joining_date'],
      'Previous Company': ['previousCompanyExperience', 'previous_company_or_city_experience', 'previous_company', 'last_company'],
      'Questions': ['candidateQuestions', 'candidate_questions', 'questions', 'queries']
    };

    // Extract using field mappings
    Object.entries(fieldMappings).forEach(([displayName, possibleKeys]) => {
      for (const key of possibleKeys) {
        if (analysis[key] !== undefined && analysis[key] !== null && analysis[key] !== '') {
          extractedData[displayName] = formatValue(analysis[key]);
          break;
        }
      }
    });

    // Add any additional fields from analysis that aren't in the standard list
    Object.keys(analysis).forEach(key => {
      // Skip if already added
      const alreadyAdded = Object.values(fieldMappings).flat().includes(key);
      if (!alreadyAdded && analysis[key] !== null && analysis[key] !== undefined && analysis[key] !== '') {
        const formattedKey = key
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim()
          .replace(/\b\w/g, l => l.toUpperCase());
        extractedData[formattedKey] = formatValue(analysis[key]);
      }
    });

    // If no data was extracted, show message
    if (Object.keys(extractedData).length === 0) {
      extractedData['Status'] = 'No data extracted from analysis';
    }
  } else {
    // No analysis data available
    extractedData['Status'] = 'Analysis not available yet';
  }



  return (
    <div style={styles.callDetailsContainer}>
      {/* Back to List Button */}
      <button
        onClick={onBack}
        style={styles.backButton}
        className="interactive-button"
      >
        <ArrowLeft size={20} />
        Back to Call History
      </button>

      {/* Call Analysis Header */}
      <div style={styles.detailsHeader}>
        <h3 style={styles.detailsTitle}>Call Analysis & Recording</h3>
        <div style={styles.callMeta}>
          <span style={styles.metaItem}>
            📞 Phone: <strong>{phoneNumber}</strong>
          </span>
          <span style={styles.metaItem}>
            ⏱️ Duration: <strong>{durationDisplay}</strong>
          </span>
          <span style={styles.metaItem}>
            Status: <span style={{
              color: callStatus === 'completed' ? '#10b981' :
                     callStatus === 'in-progress' ? '#f59e0b' : '#ef4444',
              textTransform: 'capitalize',
              fontWeight: 'bold'
            }}>
              {callStatus}
            </span>
          </span>
          <span style={styles.metaItem}>
            {/* 🤖 Bot: <strong>{botName}</strong> */}
          </span>
          <span style={styles.metaItem}>
            {/* 💰 Cost: <strong>${callCost.toFixed(4)}</strong> */}
          </span>
          <span style={styles.metaItem}>
            {/* 🧠 Model: <strong>{modelName}</strong> */}
          </span>
        </div>
      </div>

      {/* Recording Section */}
      <div style={styles.recordingSection}>
        <div style={styles.recordingCard}>
          {recordingUrl ? (
            <>
              <Play size={24} style={{color: '#10b981'}} />
              <div style={{ flex: 1 }}>
                <p style={styles.recordingLabel}>
                  🎙️ Call Recording Available
                </p>
                <audio controls style={styles.audioPlayer}>
                  <source src={recordingUrl} type="audio/mpeg" />
                  <source src={recordingUrl} type="audio/wav" />
                  <source src={recordingUrl} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
              <a
                href={recordingUrl}
                download={`call-recording-${callData.id || 'unknown'}.mp3`}
                style={styles.downloadBtn}
                className="interactive-button"
                title="Download Recording"
              >
                <Download size={16} />
              </a>
            </>
          ) : (
            <>
              <div style={{
                width: '24px',
                height: '24px',
                border: '3px solid #f59e0b',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{ flex: 1 }}>
                <p style={{...styles.recordingLabel, color: '#f59e0b'}}>
                  ⏳ Recording Processing...
                </p>
                <p style={{fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem'}}>
                  The call recording is being processed. Please check back in a few moments.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add CSS animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Extracted Information Grid */}
      <div style={styles.extractedInfo}>
        <h4 style={styles.sectionTitle}>
          Extracted Information
          <span style={{
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginLeft: '0.5rem',
            fontWeight: 'normal'
          }}>
            ({Object.keys(extractedData).length} fields)
          </span>
        </h4>
        <div style={styles.infoGrid}>
          {Object.entries(extractedData).map(([key, value]) => (
            <div key={key} style={styles.infoCard}>
              <span style={styles.infoLabel}>{key}</span>
              <span style={{
                ...styles.infoValue,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: value.length > 200 ? '150px' : 'auto',
                overflowY: value.length > 200 ? 'auto' : 'visible'
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transcript Section */}
      {transcript && (
        <div style={styles.transcriptSection}>
          <div style={styles.jsonHeader}>
            <FileText size={20} />
            <span>Call Conversation</span>
          </div>
          <div
            style={{
              ...styles.transcriptContent,
              lineHeight: '1.8',
              fontSize: '0.95rem'
            }}
            dangerouslySetInnerHTML={{
              __html: transcript
                .replace(/LLM:/g, '<strong style="color: #3b82f6;">🤖 AI:</strong>')
                .replace(/USER:/g, '<strong style="color: #10b981;">👤 User:</strong>')
                .replace(/<br\/>/g, '<br/><br/>')
            }}
          />
        </div>
      )}

      {/* Debug Section - Show all available fields */}
      {/* {!transcript && !recordingUrl && (
        <div style={{
          ...styles.transcriptSection,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <div style={styles.jsonHeader}>
            <FileText size={20} />
            <span>Debug: Available Call Data</span>
          </div>
          <div style={styles.transcriptContent}>
            <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>
              Recording and transcript not found. Here are all available fields:
            </p>
            <pre style={{
              fontSize: '0.75rem',
              color: '#bfdbfe',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {JSON.stringify(call, null, 2)}
            </pre>
          </div>
        </div>
      )} */}

    </div>
  );
};

export default CallDetailsSection;

