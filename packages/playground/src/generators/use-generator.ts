import type { MusicEvent, Timeline } from 'aleatoric';
import { useCallback, useMemo, useState } from 'react';
import {
  eventsToTimeline,
  GENERATORS,
  type GeneratorConfig,
  getGenerator,
} from './generator-configs';

const DEFAULT_GENERATOR: GeneratorConfig = (() => {
  const first = GENERATORS[0];
  if (!first) {
    throw new Error('No generators configured');
  }
  return first;
})();

interface GeneratorState {
  generatorId: string;
  params: Record<string, number | string>;
  events: MusicEvent[];
  timeline: Timeline | null;
  error: string | null;
  generate: () => void;
  setGeneratorId: (id: string) => void;
  setParam: (id: string, value: number | string) => void;
  selectedConfig: GeneratorConfig;
}

function defaultParams(
  config: GeneratorConfig,
): Record<string, number | string> {
  return Object.fromEntries(config.params.map((p) => [p.id, p.default]));
}

export function useGenerator(): GeneratorState {
  const [generatorId, setGeneratorIdState] = useState(DEFAULT_GENERATOR.id);
  const [paramsByGenerator, setParamsByGenerator] = useState<
    Record<string, Record<string, number | string>>
  >(() => Object.fromEntries(GENERATORS.map((g) => [g.id, defaultParams(g)])));
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedConfig = useMemo(
    () => getGenerator(generatorId) ?? DEFAULT_GENERATOR,
    [generatorId],
  );
  const params =
    paramsByGenerator[generatorId] ?? defaultParams(selectedConfig);

  const setGeneratorId = useCallback((id: string) => {
    setGeneratorIdState(id);
    // Stop playback is handled by the parent via timeline becoming null briefly
  }, []);

  const setParam = useCallback(
    (id: string, value: number | string) => {
      setParamsByGenerator((prev) => ({
        ...prev,
        [generatorId]: { ...prev[generatorId], [id]: value },
      }));
    },
    [generatorId],
  );

  const generate = useCallback(() => {
    const config = getGenerator(generatorId);
    if (!config) return;
    try {
      setError(null);
      const generated = config.generate(params);
      setEvents(generated);
      setTimeline(eventsToTimeline(generated));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setEvents([]);
      setTimeline(null);
    }
  }, [generatorId, params]);

  return {
    generatorId,
    params,
    events,
    timeline,
    error,
    generate,
    setGeneratorId,
    setParam,
    selectedConfig,
  };
}
