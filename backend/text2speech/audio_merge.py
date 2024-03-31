from pydub import AudioSegment
import os

NEXT_POSITION_FILE_PATH = "backend/src/assets/audio/next_position.mp3"
END_OF_TRACK_FILE_PATH = "backend/src/assets/audio/end_of_track.mp3"


def merge_audio_files_with_delay(directory_path, delay_duration):
    # Initialize an empty list to hold audio segments
    audio_segments = []
    silence_segment = AudioSegment.silent(duration=delay_duration)
    next_position_segment = AudioSegment.from_file(NEXT_POSITION_FILE_PATH)
    end_of_track_segment = AudioSegment.from_file(END_OF_TRACK_FILE_PATH)

    # Iterate over all files in the directory
    for index, filename in enumerate(os.listdir(directory_path)):
        if filename.endswith(".mp3"):
            # Load each audio file and append it to the list of segments
            file_path = directory_path + "/" + filename
            audio_segments.append(AudioSegment.from_file(file_path))
            audio_segments.append(silence_segment)

        if (
            (index % 3 == 0)
            and (index != 0)
            and (index != len(os.listdir(directory_path)) - 1)
        ):
            audio_segments.append(next_position_segment)

    merged_audio = AudioSegment.empty()
    for segment in audio_segments:
        merged_audio += segment

    merged_audio += end_of_track_segment

    return merged_audio
