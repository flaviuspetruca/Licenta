from pydub import AudioSegment
import io

NEXT_POSITION_FILE_PATH = "backend/src/assets/audio/next_position.mp3"
END_OF_TRACK_FILE_PATH = "backend/src/assets/audio/finish.mp3"


def merge_audio_files_with_delay(audio_files: list[bytes], delay_duration):
    audio_segments = []
    silence_segment = AudioSegment.silent(duration=delay_duration)
    next_position_segment = AudioSegment.from_file(NEXT_POSITION_FILE_PATH)
    end_of_track_segment = AudioSegment.from_file(END_OF_TRACK_FILE_PATH)

    for index, audio_file in enumerate(audio_files):
        file_segment = AudioSegment.from_file(io.BytesIO(audio_file))
        audio_segments.append(file_segment)
        audio_segments.append(silence_segment)

        if (index % 3 == 0) and (index != 0) and (index != len(audio_files) - 1):
            audio_segments.append(next_position_segment)

    merged_audio = AudioSegment.empty()
    for segment in audio_segments:
        merged_audio += segment

    merged_audio += end_of_track_segment

    return merged_audio
